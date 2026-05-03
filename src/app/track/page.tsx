'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

type Shipment = {
  id: string;
  status: 'paid' | 'hub_received' | 'in_transit' | 'ready_for_pickup' | 'delivered';
  tracking_number: string;
  current_location: string;
  last_updated: string;
  route233_quotes: {
    route233_inquiries: {
      description: string;
    };
  };
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
  const [shipments, setShipments] = useState<Shipment[]>([]);
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
      window.location.href = '/login';
      return;
    }
    setUser(user);
    fetchShipments();
  };

  const fetchShipments = async () => {
    try {
      const res = await fetch('/api/shipments');
      const json = await res.json();
      if (json.success) setShipments(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActiveIndex = (status: string) => STAGES.findIndex(s => s.id === status);

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-8 group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Home
        </Link>
        <header className="mb-12 flex flex-col gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Track Your Items</h1>
              <p className="text-slate-500 text-sm">Welcome, {user?.user_metadata?.full_name}</p>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-2xl text-sm border ${
              messageType === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'
            }`}>
              {message}
            </div>
          )}
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : shipments.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-20 text-center shadow-xl shadow-slate-200/50">
            <p className="text-slate-400 font-medium text-lg italic mb-6">No active shipments found.</p>
            <Button onClick={() => window.location.href = '/inquire'} className="bg-blue-600">Start Your First Request</Button>
          </div>
        ) : (
          <div className="grid gap-8">
            {shipments.map(shipment => (
              <div key={shipment.id} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{shipment.route233_quotes.route233_inquiries.description}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      TRANSIT ID: {shipment.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Status</p>
                    <p className="text-blue-600 font-black text-sm uppercase tracking-tighter">{shipment.status.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="p-10 bg-slate-50/30">
                  <div className="relative flex justify-between">
                    <div className="absolute top-5 left-0 w-full h-1 bg-slate-200 -z-0" />
                    <div 
                      className="absolute top-5 left-0 h-1 bg-blue-600 transition-all duration-1000 -z-0" 
                      style={{ width: `${(getActiveIndex(shipment.status) / (STAGES.length - 1)) * 100}%` }}
                    />

                    {STAGES.map((stage, idx) => {
                      const isActive = getActiveIndex(shipment.status) >= idx;
                      return (
                        <div key={stage.id} className="relative z-10 flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg transition-all duration-500 ${
                            isActive ? 'bg-blue-600 scale-110' : 'bg-white border-2 border-slate-200'
                          }`}>
                            {stage.icon}
                          </div>
                          <p className={`mt-4 text-[9px] font-black uppercase tracking-tighter text-center max-w-[60px] ${
                            isActive ? 'text-blue-600' : 'text-slate-400'
                          }`}>
                            {stage.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-8 bg-white flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Current Location</p>
                    <p className="text-slate-700 font-bold">{shipment.current_location}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">Updated {new Date(shipment.last_updated).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}
