export const runtime = 'edge';

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui';

type Quote = {
  id: string;
  total_landed_cost_usd: number;
  total_ghs: number;
  exchange_rate: number;
  base_cost_usd: number;
  shipping_cost_usd: number;
  service_fee_usd: number;
  customs_estimate_usd: number;
  notes: string;
  route233_inquiries: {
    description: string;
  };
};

export default function QuotePage() {
  const params = useParams();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchQuote();
  }, [params.id]);

  const fetchQuote = async () => {
    try {
      const res = await fetch(`/api/quotes/${params.id}`);
      const json = await res.json();
      if (json.success) setQuote(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await fetch(`/api/quotes/${params.id}/pay`, { method: 'POST' });
      const json = await res.json();
      if (json.success && json.authorization_url) {
        window.location.href = json.authorization_url;
      } else {
        alert(json.error || 'Payment failed to initialize');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white">Loading...</div>;
  if (!quote) return <div className="min-h-screen flex items-center justify-center bg-white text-red-500">Quote not found.</div>;

  return (
    <main className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-xl mx-auto bg-white border border-gray-200">
        <div className="bg-black p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Your Quote</h1>
          <p className="text-gray-400 text-sm opacity-80 uppercase tracking-widest font-bold">Landed Cost Estimate</p>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-tighter mb-2">Item Description</h2>
            <p className="text-slate-900 font-medium text-lg leading-relaxed">{quote.route233_inquiries.description}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-gray-600 text-sm">
              <span>US Item Cost</span>
              <span>${quote.base_cost_usd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Shipping to Ghana</span>
              <span>${quote.shipping_cost_usd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Customs & Clearing (Est.)</span>
              <span>${quote.customs_estimate_usd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Service Fee</span>
              <span>${quote.service_fee_usd.toFixed(2)}</span>
            </div>
            <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Exchange Rate</p>
                <p className="text-gray-600 font-medium text-sm">1 USD = ₵{quote.exchange_rate.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Total in GHS</p>
                <p className="text-4xl font-bold text-black leading-none">₵{quote.total_ghs.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {quote.notes && (
            <div className="mb-8 p-4 bg-gray-50 border border-gray-200 italic text-gray-500 text-sm">
              "{quote.notes}"
            </div>
          )}

          <div className="flex gap-4">
            <Button 
              className="flex-1 py-6 text-xl bg-black text-white hover:bg-gray-800 rounded-none border-none"
              onClick={handlePay}
              isLoading={paying}
            >
              Pay with MoMo / Card
            </Button>
            <Button 
              variant="outline" 
              className="px-6 py-6 border-gray-300 rounded-none bg-white text-black hover:bg-gray-100"
              onClick={() => window.print()}
            >
              🖨️
            </Button>
          </div>
          
          <p className="mt-4 text-center text-xs text-gray-400">
            Secure payment powered by Paystack. Once paid, we'll start sourcing immediately.
          </p>
        </div>
      </div>
    </main>
  );
}
