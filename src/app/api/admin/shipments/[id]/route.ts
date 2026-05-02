import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/client';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    // Trigger WhatsApp notification for status change
    // notifyCustomerOfStatusChange(params.id, status);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
