export async function verifySignature(body: string, signature: string | null) {
  if (!signature) return false;
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY!;
  
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(paystackSecret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(body)
  );
  
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hash === signature;
}

export async function initializePayment(email: string, amountGHS: number, quoteId: string) {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY!;
  
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${paystackSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amountGHS * 100), // Paystack expects amount in pesewas
      currency: 'GHS',
      metadata: {
        quote_id: quoteId,
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify`,
    }),
  });

  const data = await response.json();
  return data;
}
