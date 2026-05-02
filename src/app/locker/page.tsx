'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';

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

export default function LockerPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const lockerAddress = {
    name: `${user?.user_metadata?.full_name || 'Customer'} / R233-${user?.id?.slice(0, 4).toUpperCase()}`,
    street: "123 Philadelphia St, Unit B",
    city: "Philadelphia",
    state: "PA",
    zip: "19104",
    phone: "+1 215 555 0123"
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Digital Locker</h1>
            <p className="text-slate-500">Welcome back, {user?.user_metadata?.full_name}</p>
          </div>
          <Button variant="outline" className="text-xs" onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}>
            Sign Out
          </Button>
        </header>

        {/* US Address Section */}
        <section className="mb-12 bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black mb-2">Your Personal US Address</h2>
                <p className="text-slate-400 text-sm">Use this address when buying from US stores yourself.</p>
              </div>
              <div className="bg-blue-600 px-4 py-2 rounded-xl font-bold text-xs">DELAWARE TAX-FREE ELIGIBLE</div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Full Name / Locker ID</p>
                  <p className="text-lg font-mono">{lockerAddress.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Street Address</p>
                  <p className="text-lg font-mono">{lockerAddress.street}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">City</p>
                    <p className="text-lg font-mono">{lockerAddress.city}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">State</p>
                    <p className="text-lg font-mono">{lockerAddress.state}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">ZIP</p>
                    <p className="text-lg font-mono">{lockerAddress.zip}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Phone Number</p>
                  <p className="text-lg font-mono">{lockerAddress.phone}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-12 text-9xl opacity-10 font-black italic">USA</div>
        </section>

        <h3 className="text-xl font-black text-slate-900 mb-6 px-4">Active Shipments</h3>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : shipments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center shadow-xl shadow-slate-200">
            <p className="text-slate-400 font-medium text-lg italic mb-6">Your locker is currently empty.</p>
            <Button onClick={() => window.location.href = '/inquire'}>Start Your First Request</Button>
          </div>
        ) : (
          <div className="grid gap-8">
            {shipments.map(shipment => (
              <div key={shipment.id} className="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{shipment.route233_quotes.route233_inquiries.description}</h2>
                    <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">
                      TRACKING: {shipment.tracking_number || 'ASSIGNING...'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Current Location</p>
                    <p className="text-blue-600 font-bold">{shipment.current_location}</p>
                  </div>
                </div>

                <div className="p-8 bg-slate-50/50">
                  <div className="relative flex justify-between">
                    {/* Progress Line */}
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
                          <p className={`mt-4 text-[10px] font-bold uppercase tracking-tighter text-center max-w-[60px] ${
                            isActive ? 'text-blue-600' : 'text-slate-400'
                          }`}>
                            {stage.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6 bg-white flex justify-between items-center">
                  <p className="text-xs text-slate-400 italic">Last update: {new Date(shipment.last_updated).toLocaleString()}</p>
                  <Button variant="outline" className="text-xs py-2 px-4">Contact Support</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
