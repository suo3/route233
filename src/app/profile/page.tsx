'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label } from '@/components/ui';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

function ProfileContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    location: 'Ghana'
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data, error } = await supabase
        .from('route233_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          phone_number: data.phone_number || '',
          location: data.location || 'Ghana'
        });
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('route233_profiles')
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          location: formData.location
        });

      if (error) throw error;

      // Update auth metadata as well just in case
      await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone_number: formData.phone_number,
        }
      });

      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/track" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors group">
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Locker
          </Link>
          <Button variant="outline" onClick={handleSignOut} className="text-sm py-2 px-4 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300">
            Sign Out
          </Button>
        </div>

        <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-10 md:p-14 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-600 -z-0" />
          
          <div className="relative z-10 flex flex-col items-center mb-10">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-black text-blue-600 shadow-xl border-4 border-slate-50 mb-4 uppercase">
              {formData.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{formData.full_name || 'Your Profile'}</h1>
            <p className="text-slate-500 font-medium mt-1">{user?.email}</p>
            {profile?.role === 'admin' && (
              <span className="mt-3 px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-full">
                Admin
              </span>
            )}
          </div>

          {message && (
            <div className={`mb-8 p-4 rounded-2xl text-sm border font-medium ${
              message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>Full Name</Label>
                <Input 
                  name="full_name"
                  required 
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Kwesi Mensah"
                  className="bg-slate-50"
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input 
                  name="phone_number"
                  required 
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="024 XXX XXXX"
                  className="bg-slate-50"
                />
              </div>
            </div>

            <div>
              <Label>Primary Delivery Location</Label>
              <select 
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 appearance-none"
              >
                <option value="Ghana">Accra, Ghana (Local Delivery / Pickup)</option>
                <option value="USA">Philadelphia, USA (US Hub Pickup)</option>
              </select>
            </div>

            <div className="pt-6">
              <Button type="submit" isLoading={saving} className="w-full py-5 text-lg rounded-[1.5rem] shadow-xl shadow-blue-500/20 font-bold">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
