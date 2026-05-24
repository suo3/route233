export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/client';
import { notify } from '@/lib/notifications';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const adminSupabase = getAdminClient();

    const { status, current_location, tracking_number } = body;

    const { data, error } = await adminSupabase
      .from('route233_shipments')
      .update({
        status,
        current_location,
        tracking_number,
        last_updated: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Trigger WhatsApp notification for status change
    try {
      const { data: fullShipment } = await adminSupabase
        .from('route233_shipments')
        .select(`
          current_location,
          route233_quotes (
            route233_inquiries (
              contact_phone,
              route233_profiles (
                phone_number
              )
            )
          )
        `)
        .eq('id', id)
        .single();

      if (fullShipment) {
        const quote = fullShipment.route233_quotes as any;
        const inquiry = quote?.route233_inquiries as any;
        const customerPhone = inquiry?.contact_phone || inquiry?.route233_profiles?.phone_number;
        const location = current_location || fullShipment.current_location || 'US Hub';

        if (customerPhone) {
          // Format user-friendly status description
          const statusLabels: Record<string, string> = {
            paid: 'Paid & Processing',
            hub_received: 'Received at Philadelphia US Hub',
            in_transit: 'In Transit to Ghana',
            ready_for_pickup: 'Arrived in Ghana & Ready for Pickup',
            delivered: 'Successfully Delivered'
          };
          const friendlyStatus = statusLabels[status] || status;

          await notify.statusUpdate(customerPhone, friendlyStatus, location);
          console.log(`WhatsApp shipment status update sent to ${customerPhone}`);
        }
      }
    } catch (notifyErr) {
      console.error('Failed to trigger WhatsApp status update notification:', notifyErr);
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
