'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

type Quote = {
  id: string;
  friendly_id: string;
  total_ghs: number;
  exchange_rate: number;
  base_cost_usd: number;
  shipping_cost_usd: number;
  service_fee_usd: number;
  customs_estimate_usd: number;
  notes: string;
  route233_inquiries: {
    description: string;
    contact_email?: string;
    contact_phone?: string;
  };
};

export default function MockPayPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [momoProvider, setMomoProvider] = useState<'mtn' | 'telecel' | 'tigo'>('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    fetchQuote();
  }, [resolvedParams.id]);

  const fetchQuote = async () => {
    try {
      const res = await fetch(`/api/quotes/${resolvedParams.id}`);
      const json = await res.json();
      if (json.success) {
        setQuote(json.data);
        if (json.data.route233_inquiries?.contact_phone) {
          setPhoneNumber(json.data.route233_inquiries.contact_phone);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateSuccess = async () => {
    if (!quote) return;
    setProcessing(true);

    try {
      // 1. Compile standard Paystack Webhook payload structure
      const reference = `mock-ref-${quote.id}-${Date.now()}`;
      const payload = {
        event: 'charge.success',
        data: {
          reference,
          amount: Math.round(quote.total_ghs * 100), // in pesewas
          currency: 'GHS',
          metadata: {
            quote_id: quote.id,
            is_mock: true,
          },
        },
      };

      // 2. Direct POST to our local secure Paystack webhook handler
      const res = await fetch('/api/webhooks/paystack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.received) {
        setPaymentSuccess(true);
        setTimeout(() => {
          router.push('/track?message=Payment simulated successfully. Welcome to Route233!&type=success');
        }, 2000);
      } else {
        alert(json.error || 'Failed to simulate payment webhook callback.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Error triggering payment simulation: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    router.push(`/quotes/${resolvedParams.id}?message=Payment checkout cancelled.&type=error`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 font-bold">
        Quote not found.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-none border border-gray-200 overflow-hidden">
        {/* Banner */}
        <div className="bg-amber-400 p-6 text-black flex justify-between items-center">
          <div>
            <span className="text-[10px] tracking-widest font-black uppercase bg-black text-white px-2 py-0.5 mb-1 inline-block">
              DEVELOPMENT SIMULATOR
            </span>
            <h1 className="text-xl font-bold uppercase tracking-tight leading-none">Paystack Checkout</h1>
          </div>
          <span className="text-2xl font-black">233</span>
        </div>

        {/* Success Screen Overlay */}
        {paymentSuccess ? (
          <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px] animate-fade-in bg-white">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-4xl mb-4 animate-bounce">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">Payment Authorized!</h2>
            <p className="text-gray-500 text-sm max-w-xs mb-4">
              Your simulated payment of <strong className="text-black">₵{quote.total_ghs.toLocaleString()}</strong> GHS has been successfully captured.
            </p>
            <p className="text-gray-400 text-xs animate-pulse">
              Redirecting you to your digital locker...
            </p>
          </div>
        ) : (
          <div className="p-8">
            {/* Amount Summary */}
            <div className="text-center mb-8 border-b border-gray-100 pb-6">
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Paying in GHS</p>
              <h2 className="text-4xl font-black text-black">₵{quote.total_ghs.toLocaleString()}</h2>
              <p className="text-gray-500 text-xs mt-2 truncate">
                For Quote <span className="font-bold text-slate-800">{quote.friendly_id}</span>
              </p>
            </div>

            {/* Provider Selector */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Choose MoMo Provider</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setMomoProvider('mtn')}
                  className={`py-3 text-xs font-bold border transition-all ${
                    momoProvider === 'mtn'
                      ? 'border-yellow-400 bg-yellow-50 text-yellow-800'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  MTN MoMo
                </button>
                <button
                  type="button"
                  onClick={() => setMomoProvider('telecel')}
                  className={`py-3 text-xs font-bold border transition-all ${
                    momoProvider === 'telecel'
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Telecel Cash
                </button>
                <button
                  type="button"
                  onClick={() => setMomoProvider('tigo')}
                  className={`py-3 text-xs font-bold border transition-all ${
                    momoProvider === 'tigo'
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  AirtelTigo
                </button>
              </div>
            </div>

            {/* Phone input */}
            <div className="mb-8">
              <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Mobile Money Number</label>
              <input
                required
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 0241234567"
                className="w-full border border-gray-200 px-4 py-3 rounded-none focus:outline-none focus:border-yellow-400 font-mono text-lg text-black"
              />
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Button
                onClick={handleSimulateSuccess}
                isLoading={processing}
                className="w-full py-4 text-base font-bold bg-green-600 text-white hover:bg-green-700 rounded-none border-none shadow-lg"
              >
                Simulate Successful Capture
              </Button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={processing}
                className="w-full text-center text-xs font-bold text-gray-400 hover:text-black py-2 transition-colors uppercase tracking-widest"
              >
                Cancel & Go Back
              </button>
            </div>

            <p className="mt-8 text-center text-[10px] text-gray-400 leading-relaxed">
              This is a sandboxed developer tool simulating a real Paystack environment checkout session. 
              No funds will be charged. Successful capture will trigger database transactions and dynamic notifications.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
