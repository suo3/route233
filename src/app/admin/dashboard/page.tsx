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
  contact_email?: string;
  contact_phone?: string;
  rejection_reason?: string;
  created_at: string;
  route233_profiles: {
    full_name: string;
    phone_number: string;
  } | null;
  route233_quotes?: any[];
  images?: string[];
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
      console.error('Failed to add user:', err);
      let userFriendly = 'Could not create the user account. Please check the connection and try again.';
      if (err.message) {
        if (err.message.toLowerCase().includes('already registered') || err.message.toLowerCase().includes('already exists')) {
          userFriendly = 'An account with this email address already exists.';
        } else if (err.message.toLowerCase().includes('password should be')) {
          userFriendly = 'Password must be at least 6 characters long for security.';
        } else {
          userFriendly = err.message;
        }
      }
      alert('Unable to Create Account: ' + userFriendly);
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
          ),
          route233_quotes (
            id,
            base_cost_usd,
            shipping_cost_usd,
            service_fee_usd,
            customs_estimate_usd,
            exchange_rate,
            notes
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
        <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-8 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-black dark:text-white">233 Logistics Admin</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage sourcing requests and track shipments.</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-1 flex gap-1 overflow-x-auto no-scrollbar w-full lg:w-auto">
            {(['pending', 'quoted', 'shipments', 'rejected', 'users'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 capitalize font-bold transition-all whitespace-nowrap text-sm ${
                  activeTab === tab 
                    ? 'bg-black text-white dark:bg-white dark:text-black' 
                    : 'text-gray-500 hover:text-black dark:hover:text-white'
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
              <div className="bg-white border border-gray-200 p-20 text-center">
                <p className="text-gray-500 font-medium italic">No active shipments found.</p>
              </div>
            ) : (
              shipments.map(shipment => (
                <div key={shipment.id} className="bg-white border border-gray-200 p-6 flex justify-between items-center text-black">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{shipment.route233_quotes.route233_inquiries.description}</h3>
                    <p className="text-gray-500 text-sm">Customer: {shipment.route233_quotes.route233_inquiries.route233_profiles.full_name}</p>
                    <p className="text-xs text-black mt-2 font-mono uppercase tracking-tighter">Location: {shipment.current_location}</p>
                  </div>
                  <div className="flex gap-2">
                    <select 
                      className="bg-white border border-gray-300 rounded-none px-4 py-2 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black"
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
              <div className="bg-white border border-gray-200 p-20 text-center">
                <p className="text-gray-500 font-medium italic">No users found.</p>
              </div>
            ) : (
              users.map(u => (
                <div key={u.id} className="bg-white border border-gray-200 p-6 flex justify-between items-center text-black">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{u.profile?.full_name || 'No Name'}</h3>
                    <p className="text-gray-500 text-sm">{u.email} &bull; {u.profile?.phone_number || 'No phone'}</p>
                    <p className="text-xs text-gray-400 mt-2 font-mono uppercase tracking-tighter">
                      Joined: {new Date(u.created_at).toLocaleDateString()} &bull; Role: {u.profile?.role || 'None'}
                    </p>
                  </div>
                  <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 rounded-none" onClick={() => deleteUser(u.id)}>
                    Delete User
                  </Button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredInquiries.length === 0 ? (
              <div className="bg-white border border-gray-200 p-20 text-center">
                <p className="text-gray-500 font-medium italic">No inquiries found in this category.</p>
              </div>
            ) : (
              filteredInquiries.map(inquiry => (
                <div 
                  key={inquiry.id} 
                  className="bg-white border border-gray-200 p-6 text-black group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 flex items-center justify-center text-xl border ${
                        inquiry.category === 'automotive' ? 'bg-orange-50 border-orange-200 text-orange-600' :
                        inquiry.category === 'electronics' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}>
                        {inquiry.category === 'automotive' ? '🚗' : inquiry.category === 'electronics' ? '⚡' : '📦'}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{inquiry.route233_profiles?.full_name || inquiry.contact_email || 'Anonymous User'}</h3>
                        <p className="text-gray-500 text-sm">{inquiry.route233_profiles?.phone_number || inquiry.contact_phone || 'No phone'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Status</p>
                      <span className={`px-3 py-1 text-xs font-bold uppercase border ${
                        inquiry.status === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                        inquiry.status === 'quoted' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-bold mb-2 tracking-tighter">Description</p>
                        <p className="text-black">{inquiry.description}</p>
                      </div>
                      {inquiry.source_url && (
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-bold mb-2 tracking-tighter">Sourcing URL</p>
                          <a 
                            href={inquiry.source_url} 
                            target="_blank" 
                            className="text-black underline text-sm break-all font-medium"
                          >
                            {inquiry.source_url}
                          </a>
                        </div>
                      )}
                      {inquiry.images && inquiry.images.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-bold mb-2 tracking-tighter">Reference Photos ({inquiry.images.length})</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {inquiry.images.map((img: string, idx: number) => (
                              <a 
                                key={idx} 
                                href={img} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="w-20 h-20 border border-gray-300 hover:border-black transition-all bg-gray-50 flex items-center justify-center overflow-hidden hover:scale-105 active:scale-95 duration-200"
                                title="Click to view full image"
                              >
                                <img 
                                  src={img} 
                                  alt={`Reference ${idx + 1}`} 
                                  className="w-full h-full object-cover" 
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 p-6 border border-gray-200 flex flex-col justify-between">
                      {inquiry.status === 'rejected' ? (
                        <div>
                          <p className="text-xs text-red-600 uppercase font-bold mb-2">Rejection Reason</p>
                          <p className="text-black text-sm italic">"{inquiry.rejection_reason}"</p>
                          <Button variant="outline" className="mt-6 w-full text-xs py-2 rounded-none">Overrule & Approve</Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-sm font-bold">Landed Cost Quote</span>
                            <span className={`text-xs px-2 py-1 font-bold ${inquiry.status === 'quoted' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-black text-white'}`}>
                              {inquiry.status === 'quoted' ? 'Sent to Customer' : 'Action Required'}
                            </span>
                          </div>
                          <Button 
                            className="w-full bg-black text-white hover:bg-gray-800 rounded-none border-none"
                            onClick={() => setSelectedInquiry(inquiry)}
                          >
                            {inquiry.status === 'quoted' ? 'Update Quote' : 'Generate Quote'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                    <div className="flex gap-4">
                      <span>ID: {inquiry.id}</span>
                      <span>Received: {new Date(inquiry.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="text-xs py-1 px-3 rounded-none" onClick={() => editInquiry(inquiry)}>Edit</Button>
                      <Button variant="outline" className="text-xs py-1 px-3 text-red-600 border-red-600 hover:bg-red-50 rounded-none" onClick={() => deleteInquiry(inquiry.id)}>Delete</Button>
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
