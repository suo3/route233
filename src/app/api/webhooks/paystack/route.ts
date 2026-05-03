import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/client';
import { verifySignature } from '@/lib/paystack';

export async function POST(request: Request) {
  try {
    const textBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!verifySignature(textBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const body = JSON.parse(textBody);
    const adminSupabase = getAdminClient();

    if (body.event === 'charge.success') {
      const { reference, metadata, amount, currency } = body.data;
      const quoteId = metadata.quote_id;

      // 1. Record the payment
      const { error: paymentError } = await adminSupabase
        .from('route233_payments')
        .insert([{
          quote_id: quoteId,
          paystack_reference: reference,
          amount: amount / 100,
          currency,
          status: 'success',
          raw_response: body
        }]);

      if (paymentError) throw paymentError;

      // 2. Create the shipment record
      const { error: shipmentError } = await adminSupabase
        .from('route233_shipments')
        .insert([{
          quote_id: quoteId,
          status: 'paid',
          current_location: 'Philadelphia Hub'
        }]);

      if (shipmentError) throw shipmentError;

      // 3. Update inquiry status to 'approved' (since it's now paid)
      const { data: quote } = await adminSupabase.from('route233_quotes').select('inquiry_id').eq('id', quoteId).single();
      if (quote) {
        await adminSupabase.from('route233_inquiries').update({ status: 'approved' }).eq('id', quote.inquiry_id);
      }

      console.log(`Payment processed for quote ${quoteId}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
