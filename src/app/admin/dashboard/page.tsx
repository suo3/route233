'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import QuoteModal from '@/components/QuoteModal';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

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

type Shipment = {
  id: string;
  status: string;
  current_location: string;
  tracking_number: string;
  last_updated: string;
  route233_quotes: {
    route233_inquiries: {
      description: string;
      route233_profiles: {
        full_name: string;
      };
    };
  };
};

export default function AdminDashboard() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'quoted' | 'shipments' | 'rejected' | 'users'>('pending');
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  useEffect(() => {
    verifyAdminAndFetch();
  }, [activeTab]);

  const verifyAdminAndFetch = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    const { data: profile } = await supabase.from('route233_profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      window.location.href = '/';
      return;
    }

    if (activeTab === 'shipments') {
      await fetchShipments();
    } else if (activeTab === 'users') {
      await fetchUsers();
    } else {
      await fetchInquiries();
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      const json = await res.json();
      if (json.success) setUsers(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to completely delete this user? This cannot be undone.')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const addUser = async () => {
    const email = prompt('Enter new user email:');
    if (!email) return;
    const password = prompt('Enter new user password (min 6 chars):');
    if (!password) return;
    const fullName = prompt('Enter full name:');
    if (!fullName) return;
    const phone = prompt('Enter phone number (optional):');
    const role = prompt('Enter role (customer or admin):', 'customer');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}` 
        },
        body: JSON.stringify({ email, password, fullName, phone, role })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      fetchUsers();
    } catch (err: any) {
      alert('Failed to add user: ' + err.message);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return;
    try {
      await supabase.from('route233_inquiries').delete().eq('id', id);
      fetchInquiries();
    } catch (err) {
      console.error(err);
    }
  };

  const editInquiry = async (inquiry: Inquiry) => {
    const newDesc = prompt('Edit Description:', inquiry.description);
    if (!newDesc) return;
    try {
      await supabase.from('route233_inquiries').update({ description: newDesc }).eq('id', inquiry.id);
      fetchInquiries();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('route233_inquiries')
        .select(`
          *,
          route233_profiles (
            full_name,
            phone_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data as any);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('route233_shipments')
        .select(`
          *,
          route233_quotes (
            route233_inquiries (
              description,
              route233_profiles (
                full_name
              )
            )
          )
        `)
        .order('last_updated', { ascending: false });

      if (error) throw error;
      setShipments(data as any);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateShipmentStatus = async (id: string, status: string, location: string) => {
    try {
      await fetch(`/api/admin/shipments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, current_location: location })
      });
      fetchShipments();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredInquiries = inquiries.filter(i => {
    if (activeTab === 'pending') return i.status === 'pending' || i.status === 'sourcing';
    return i.status === activeTab;
  });

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors mb-8 group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Site
        </Link>
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Route233 Admin</h1>
            <p className="text-slate-400">Manage sourcing requests and track shipments.</p>
          </div>
          <div className="bg-slate-800 p-1 rounded-xl flex gap-1">
            {(['pending', 'quoted', 'shipments', 'rejected', 'users'] as const).map(tab => (
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
        ) : activeTab === 'shipments' ? (
          <div className="grid gap-6">
            {shipments.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-20 text-center">
                <p className="text-slate-500 font-medium italic">No active shipments found.</p>
              </div>
            ) : (
              shipments.map(shipment => (
                <div key={shipment.id} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{shipment.route233_quotes.route233_inquiries.description}</h3>
                    <p className="text-slate-400 text-sm">Customer: {shipment.route233_quotes.route233_inquiries.route233_profiles.full_name}</p>
                    <p className="text-xs text-blue-400 mt-2 font-mono uppercase tracking-tighter">Location: {shipment.current_location}</p>
                  </div>
                  <div className="flex gap-2">
                    <select 
                      className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={shipment.status}
                      onChange={(e) => updateShipmentStatus(shipment.id, e.target.value, shipment.current_location)}
                    >
                      <option value="paid">Paid</option>
                      <option value="hub_received">Hub Received</option>
                      <option value="in_transit">In Transit</option>
                      <option value="ready_for_pickup">Ready in Ghana</option>
                      <option value="delivered">Delivered</option>
                    </select>
                    <Button 
                      variant="outline" 
                      className="text-xs py-2"
                      onClick={() => {
                        const newLoc = prompt('Enter new location:', shipment.current_location);
                        if (newLoc) updateShipmentStatus(shipment.id, shipment.status, newLoc);
                      }}
                    >
                      Update Loc
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'users' ? (
          <div className="grid gap-6">
            <div className="flex justify-end mb-4">
              <Button onClick={addUser}>+ Add New User</Button>
            </div>
            {users.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-20 text-center">
                <p className="text-slate-500 font-medium italic">No users found.</p>
              </div>
            ) : (
              users.map(u => (
                <div key={u.id} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{u.profile?.full_name || 'No Name'}</h3>
                    <p className="text-slate-400 text-sm">{u.email} &bull; {u.profile?.phone_number || 'No phone'}</p>
                    <p className="text-xs text-slate-500 mt-2 font-mono uppercase tracking-tighter">
                      Joined: {new Date(u.created_at).toLocaleDateString()} &bull; Role: {u.profile?.role || 'None'}
                    </p>
                  </div>
                  <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-500/10" onClick={() => deleteUser(u.id)}>
                    Delete User
                  </Button>
                </div>
              ))
            )}
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
                    <div className="flex gap-4">
                      <span>ID: {inquiry.id}</span>
                      <span>Received: {new Date(inquiry.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="text-xs py-1 px-3" onClick={() => editInquiry(inquiry)}>Edit</Button>
                      <Button variant="outline" className="text-xs py-1 px-3 text-red-500 border-red-500 hover:bg-red-500/10" onClick={() => deleteInquiry(inquiry.id)}>Delete</Button>
                    </div>
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
