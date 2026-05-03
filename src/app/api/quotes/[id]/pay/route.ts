import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { initializePayment } from '@/lib/paystack';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await params;

    // 1. Fetch the quote and customer details
    const { data: quote, error: quoteError } = await supabase
      .from('route233_quotes')
      .select(`
        *,
        route233_inquiries (
          customer_id,
          route233_profiles (
            full_name
          )
        )
      `)
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) throw new Error('Quote not found');

    // 2. Initialize Paystack
    // For demo purposes, we'll use a placeholder email. In a real app, get it from the profile.
    const email = 'customer@example.com';
    const amountGHS = quote.total_landed_cost_ghs;

    const paystackSession = await initializePayment(email, amountGHS, quoteId);

    if (!paystackSession.status) {
      throw new Error(paystackSession.message || 'Paystack initialization failed');
    }

    return NextResponse.json({ 
      success: true, 
      authorization_url: paystackSession.data.authorization_url 
    });
  } catch (error: any) {
    console.error('Payment initialization error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
