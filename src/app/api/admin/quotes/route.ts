import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const adminSupabase = getAdminClient();
    const body = await request.json();
    
    const { 
      inquiry_id, 
      admin_id, 
      base_cost_usd, 
      shipping_cost_usd, 
      service_fee_usd, 
      customs_estimate_usd,
      exchange_rate,
      notes,
      expires_at
    } = body;

    // Calculate Landed Cost in USD and GHS
    const total_usd = Number(base_cost_usd) + Number(shipping_cost_usd) + Number(service_fee_usd) + Number(customs_estimate_usd);
    const rate = exchange_rate || 13.50; // Default or provided rate
    const total_ghs = total_usd * rate;

    // Start a transaction-like flow (Supabase RPC or sequential calls)
    // 1. Create the quote
    const { data: quote, error: quoteError } = await adminSupabase
      .from('route233_quotes')
      .insert([
        {
          inquiry_id,
          admin_id,
          base_cost_usd,
          shipping_cost_usd,
          service_fee_usd,
          customs_estimate_usd,
          exchange_rate: rate,
          total_landed_cost_ghs: total_ghs,
          notes,
          expires_at
        }
      ])
      .select()
      .single();

    if (quoteError) throw quoteError;

    // 2. Update the inquiry status to 'quoted'
    const { error: inquiryError } = await adminSupabase
      .from('route233_inquiries')
      .update({ status: 'quoted' })
      .eq('id', inquiry_id);

    if (inquiryError) throw inquiryError;

    // 3. Trigger WhatsApp notification to the Customer
    // notifyCustomerOfQuote(inquiry_id, total_ghs);

    return NextResponse.json({ success: true, data: quote });
  } catch (error: any) {
    console.error('Quote creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
