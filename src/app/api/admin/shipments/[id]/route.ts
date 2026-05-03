import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/client';

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
    // notifyCustomerOfStatusChange(params.id, status);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
