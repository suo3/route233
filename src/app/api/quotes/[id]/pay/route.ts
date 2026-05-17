import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/client';
import { initializePayment } from '@/lib/paystack';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await params;

    const adminSupabase = getAdminClient();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(quoteId);

    // 1. Fetch the quote and customer details
    const { data: quote, error: quoteError } = await adminSupabase
      .from('route233_quotes')
      .select(`
        *,
        route233_inquiries (
          customer_id,
          contact_email,
          route233_profiles (
            full_name
          )
        )
      `)
      .eq(isUUID ? 'id' : 'friendly_id', quoteId)
      .single();

    if (quoteError || !quote) throw new Error('Quote not found');

    // 2. Initialize Paystack
    const inquiry = quote.route233_inquiries as any;
    const email = inquiry?.contact_email || 'customer@example.com';
    const amountGHS = quote.total_ghs;

    const paystackSession = await initializePayment(email, amountGHS, quote.id);

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
