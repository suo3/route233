'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

type DashboardData = {
  inquiries: any[];
  quotes: any[];
  shipments: any[];
};

const STAGES = [
  { id: 'paid', label: 'Order Paid', icon: '💰' },
  { id: 'hub_received', label: 'At Philly Hub', icon: '🏢' },
  { id: 'in_transit', label: 'In Transit', icon: '✈️' },
  { id: 'ready_for_pickup', label: 'Ready in Ghana', icon: '🇬🇭' },
  { id: 'delivered', label: 'Delivered', icon: '✅' },
];

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<DashboardData>({ inquiries: [], quotes: [], shipments: [] });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');

  useEffect(() => {
    const msg = searchParams.get('message');
    const type = searchParams.get('type') as 'error' | 'success';
    if (msg) {
      setMessage(msg);
      if (type) setMessageType(type);
    }
  }, [searchParams]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);
    fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch all three types of active user data
      const [inquiriesRes, quotesRes, shipmentsRes] = await Promise.all([
        supabase.from('route233_inquiries')
          .select('*')
          .in('status', ['pending', 'sourcing', 'rejected'])
          .order('created_at', { ascending: false }),
        supabase.from('route233_quotes')
          .select('*, route233_inquiries!inner(description, status)')
          .eq('route233_inquiries.status', 'quoted')
          .order('created_at', { ascending: false }),
        supabase.from('route233_shipments')
          .select('*, route233_quotes(route233_inquiries(description))')
          .order('last_updated', { ascending: false })
      ]);

      setData({
        inquiries: inquiriesRes.data || [],
        quotes: quotesRes.data || [],
        shipments: shipmentsRes.data || []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActiveIndex = (status: string) => STAGES.findIndex(s => s.id === status);
  const isEmpty = data.inquiries.length === 0 && data.quotes.length === 0 && data.shipments.length === 0;

  return (
    <main className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-black transition-colors mb-8 group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Home
        </Link>
        <header className="mb-12 flex flex-col gap-6 bg-white p-6 md:p-8 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-black tracking-tight">Your Locker</h1>
              <p className="text-gray-500 text-sm">Welcome back, {user?.user_metadata?.full_name || 'Customer'}</p>
            </div>
            <Button onClick={() => router.push('/inquire')} className="w-full md:w-auto bg-black text-white hover:bg-gray-800 rounded-none border-none">New Request</Button>
          </div>

          {message && (
            <div className={`p-4 rounded-none text-sm border ${
              messageType === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'
            }`}>
              {message}
            </div>
          )}
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full" />
          </div>
        ) : isEmpty ? (
          <div className="bg-white border border-gray-200 p-10 md:p-20 text-center">
            <p className="text-gray-400 font-medium text-lg mb-6">Your locker is empty.</p>
            <Button onClick={() => router.push('/inquire')} className="w-full md:w-auto bg-black text-white rounded-none hover:bg-gray-800 border-none">Start Sourcing</Button>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* ACTION REQUIRED: QUOTES */}
            {data.quotes.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-black mb-4 flex items-center">
                  <span className="w-3 h-3 rounded-full bg-black mr-3 animate-pulse" />
                  Action Required
                </h2>
                <div className="grid gap-6">
                  {data.quotes.map(quote => (
                    <div key={quote.id} className="bg-gray-50 border border-black p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-black">{quote.route233_inquiries?.description}</h3>
                        <p className="text-sm text-gray-600 mt-1">Total: ₵{quote.total_ghs?.toLocaleString()}</p>
                      </div>
                      <Button onClick={() => router.push(`/quotes/${quote.friendly_id || quote.id}`)} className="w-full md:w-auto bg-black text-white hover:bg-gray-800 rounded-none border-none">View Quote</Button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* INQUIRIES: PENDING/SOURCING */}
            {data.inquiries.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-black mb-4">Pending Requests</h2>
                <div className="grid gap-6">
                  {data.inquiries.map(inquiry => (
                    <div key={inquiry.id} className="bg-white border border-gray-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-black">{inquiry.description}</h3>
                        <p className="text-xs text-gray-500 uppercase font-bold mt-1 tracking-widest">{inquiry.status}</p>
                      </div>
                      <div className="text-gray-500 text-sm font-medium italic">
                        {inquiry.status === 'rejected' ? 'Rejected' : 'Our team is working on it'}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ACTIVE SHIPMENTS */}
            {data.shipments.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-black mb-4">Active Shipments</h2>
                <div className="grid gap-8">
                  {data.shipments.map(shipment => (
                    <div key={shipment.id} className="bg-white border border-gray-200">
                      <div className="p-6 md:p-8 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                          <h2 className="text-xl font-bold text-black mb-2">{shipment.route233_quotes?.route233_inquiries?.description}</h2>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            TRANSIT ID: {shipment.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Status</p>
                          <p className="text-black font-bold text-sm uppercase tracking-tighter">{shipment.status.replace('_', ' ')}</p>
                        </div>
                      </div>

                      <div className="p-6 md:p-10 bg-gray-50">
                        {/* Horizontal for Desktop, Vertical for Mobile */}
                        <div className="relative hidden md:flex justify-between">
                          <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-0" />
                          <div 
                            className="absolute top-5 left-0 h-1 bg-black transition-all duration-1000 -z-0" 
                            style={{ width: `${(getActiveIndex(shipment.status) / (STAGES.length - 1)) * 100}%` }}
                          />

                          {STAGES.map((stage, idx) => {
                            const isActive = getActiveIndex(shipment.status) >= idx;
                            return (
                              <div key={stage.id} className="relative z-10 flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500 ${
                                  isActive ? 'bg-black text-white' : 'bg-white border-2 border-gray-200 text-gray-300'
                                }`}>
                                  {stage.icon}
                                </div>
                                <p className={`mt-4 text-[9px] font-bold uppercase tracking-tighter text-center max-w-[60px] ${
                                  isActive ? 'text-black' : 'text-gray-400'
                                }`}>
                                  {stage.label}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {/* Mobile Vertical Stepper */}
                        <div className="md:hidden space-y-4">
                          {STAGES.map((stage, idx) => {
                            const isActive = getActiveIndex(shipment.status) >= idx;
                            return (
                              <div key={stage.id} className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                                  isActive ? 'bg-black text-white' : 'bg-white border-2 border-gray-200 text-gray-300'
                                }`}>
                                  {stage.icon}
                                </div>
                                <div className="h-[1px] flex-grow bg-gray-200" />
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${
                                  isActive ? 'text-black' : 'text-gray-400'
                                }`}>
                                  {stage.label}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="p-6 md:p-8 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t border-gray-200">
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Current Location</p>
                          <p className="text-black font-bold">{shipment.current_location}</p>
                        </div>
                        <p className="text-[10px] text-gray-400">Updated {new Date(shipment.last_updated).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full" />
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}
