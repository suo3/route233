'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import QuoteModal from '@/components/QuoteModal';

type Inquiry = {
  id: string;
  status: string;
  category: string;
  description: string;
  source_url: string;
  rejection_reason?: string;
  created_at: string;
  route233_profiles: {
    full_name: string;
    phone_number: string;
  };
};

export default function AdminDashboard() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'quoted' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/admin/inquiries');
      const json = await res.json();
      if (json.success) setInquiries(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInquiries = inquiries.filter(i => {
    if (activeTab === 'pending') return i.status === 'pending' || i.status === 'sourcing';
    return i.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Route233 Admin</h1>
            <p className="text-slate-400">Manage sourcing requests and calculate landed costs.</p>
          </div>
          <div className="bg-slate-800 p-1 rounded-xl flex gap-1">
            {(['pending', 'quoted', 'rejected'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg capitalize font-medium transition-all ${
                  activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredInquiries.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-20 text-center">
                <p className="text-slate-500 font-medium italic">No inquiries found in this category.</p>
              </div>
            ) : (
              filteredInquiries.map(inquiry => (
                <div 
                  key={inquiry.id} 
                  className="bg-slate-800 border border-slate-700 rounded-3xl p-6 hover:border-slate-600 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                        inquiry.category === 'automotive' ? 'bg-orange-500/10 text-orange-500' :
                        inquiry.category === 'electronics' ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-500/10 text-slate-400'
                      }`}>
                        {inquiry.category === 'automotive' ? '🚗' : inquiry.category === 'electronics' ? '⚡' : '📦'}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{inquiry.route233_profiles?.full_name || 'Anonymous User'}</h3>
                        <p className="text-slate-400 text-sm">{inquiry.route233_profiles?.phone_number || 'No phone'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Status</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        inquiry.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        inquiry.status === 'quoted' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold mb-2 tracking-tighter">Description</p>
                        <p className="text-slate-200">{inquiry.description}</p>
                      </div>
                      {inquiry.source_url && (
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold mb-2 tracking-tighter">Sourcing URL</p>
                          <a 
                            href={inquiry.source_url} 
                            target="_blank" 
                            className="text-blue-400 hover:underline text-sm break-all"
                          >
                            {inquiry.source_url}
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 flex flex-col justify-between">
                      {inquiry.status === 'rejected' ? (
                        <div>
                          <p className="text-xs text-red-400 uppercase font-bold mb-2">Rejection Reason</p>
                          <p className="text-slate-300 text-sm italic">"{inquiry.rejection_reason}"</p>
                          <Button variant="outline" className="mt-6 w-full text-xs py-2">Overrule & Approve</Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-sm font-bold">Landed Cost Quote</span>
                            <span className={`text-xs px-2 py-1 rounded ${inquiry.status === 'quoted' ? 'bg-green-600/20 text-green-400' : 'bg-blue-600/20 text-blue-400'}`}>
                              {inquiry.status === 'quoted' ? 'Sent to Customer' : 'Action Required'}
                            </span>
                          </div>
                          <Button 
                            variant="primary" 
                            className="w-full"
                            onClick={() => setSelectedInquiry(inquiry)}
                          >
                            {inquiry.status === 'quoted' ? 'Update Quote' : 'Generate Quote'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-500">
                    <span>ID: {inquiry.id}</span>
                    <span>Received: {new Date(inquiry.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {selectedInquiry && (
        <QuoteModal 
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onSuccess={() => fetchInquiries()}
        />
      )}
    </div>
  );
}
