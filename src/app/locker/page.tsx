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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipments();
  }, []);

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
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Your Digital Locker</h1>
          <p className="text-slate-500">Track your items from Philadelphia to Ghana.</p>
        </header>

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
