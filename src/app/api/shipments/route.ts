import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    // In a real app, you would get the customer_id from the auth session
    const customer_id = 'd290f1ee-6c54-4b01-90e6-d701748f0851'; // Placeholder

    const { data, error } = await supabase
      .from('route233_shipments')
      .select(`
        *,
        route233_quotes (
          *,
          route233_inquiries (
            description,
            images
          )
        )
      `)
      .order('last_updated', { ascending: false });

    if (error) throw error;

    // Filter by customer_id (since RLS might not be fully configured for this specific join yet)
    const customerShipments = data?.filter(s => s.route233_quotes?.route233_inquiries?.customer_id === customer_id);

    return NextResponse.json({ success: true, data: customerShipments });
  } catch (error: any) {
    console.error('Shipment fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
