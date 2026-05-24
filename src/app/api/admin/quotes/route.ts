export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/client';
import { notify } from '@/lib/notifications';

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
    // 1. Check if a quote already exists for this inquiry
    const { data: existingQuote } = await adminSupabase
      .from('route233_quotes')
      .select('id, friendly_id')
      .eq('inquiry_id', inquiry_id)
      .maybeSingle();

    let quote;
    let quoteError;

    if (existingQuote) {
      // Update the existing quote
      const { data: updatedQuote, error: updateError } = await adminSupabase
        .from('route233_quotes')
        .update({
          admin_id,
          base_cost_usd,
          shipping_cost_usd,
          service_fee_usd,
          customs_estimate_usd,
          exchange_rate: rate,
          total_ghs: total_ghs,
          notes
        })
        .eq('id', existingQuote.id)
        .select()
        .single();
      
      quote = updatedQuote;
      quoteError = updateError;
    } else {
      // Create a new quote
      const friendly_id = `QT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const { data: insertedQuote, error: insertError } = await adminSupabase
        .from('route233_quotes')
        .insert([
          {
            inquiry_id,
            admin_id,
            friendly_id,
            base_cost_usd,
            shipping_cost_usd,
            service_fee_usd,
            customs_estimate_usd,
            exchange_rate: rate,
            total_ghs: total_ghs,
            notes
          }
        ])
        .select()
        .single();
      
      quote = insertedQuote;
      quoteError = insertError;
    }

    if (quoteError) throw quoteError;

    // 2. Update the inquiry status to 'quoted'
    const { error: inquiryError } = await adminSupabase
      .from('route233_inquiries')
      .update({ status: 'quoted' })
      .eq('id', inquiry_id);

    if (inquiryError) throw inquiryError;

    // 3. Trigger WhatsApp notification to the Customer
    try {
      const { data: inquiry } = await adminSupabase
        .from('route233_inquiries')
        .select('contact_phone, route233_profiles(phone_number)')
        .eq('id', inquiry_id)
        .single();

      const customerPhone = inquiry?.contact_phone || (inquiry?.route233_profiles as any)?.phone_number;

      if (customerPhone) {
        await notify.quoteReady(
          customerPhone,
          total_ghs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          quote?.friendly_id || quote?.id || ''
        );
        console.log(`WhatsApp quote alert successfully sent to ${customerPhone}`);
      } else {
        console.warn(`Could not send WhatsApp alert: No phone number found for inquiry ${inquiry_id}`);
      }
    } catch (notifyErr) {
      console.error('Failed to trigger WhatsApp quote notification:', notifyErr);
    }

    return NextResponse.json({ success: true, data: quote });
  } catch (error: any) {
    console.error('Quote creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
