export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: Request) {
  try {
    let customer_id = 'd290f1ee-6c54-4b01-90e6-d701748f0851'; // Fallback Placeholder for backward compatibility/demo

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (user && !authError) {
        customer_id = user.id;
      }
    }

    const { data, error } = await supabase
      .from('route233_shipments')
      .select(`
        *,
        route233_quotes (
          *,
          route233_inquiries (
            customer_id,
            description,
            images
          )
        )
      `)
      .order('last_updated', { ascending: false });

    if (error) throw error;

    // Filter by customer_id
    const customerShipments = data?.filter(s => s.route233_quotes?.route233_inquiries?.customer_id === customer_id);

    return NextResponse.json({ success: true, data: customerShipments });
  } catch (error: any) {
    console.error('Shipment fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
