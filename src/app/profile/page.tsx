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
      console.error('Error fetching profile:', err);
      let userFriendly = 'We had trouble loading your profile details. Please try refreshing the page.';
      if (err.message && (err.message.toLowerCase().includes('schema cache') || err.message.toLowerCase().includes('column'))) {
        userFriendly = 'Our profile system is undergoing minor maintenance. Please refresh the page in a moment.';
      }
      setMessage({ text: userFriendly, type: 'error' });
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
      console.error('Profile update error:', err);
      let userFriendly = 'Failed to update profile. Please check your network and try again.';
      if (err.message) {
        if (err.message.toLowerCase().includes('schema cache') || err.message.toLowerCase().includes('column')) {
          userFriendly = 'Our database is undergoing minor updates. Please wait a moment and try saving again.';
        } else if (err.message.toLowerCase().includes('policy') || err.message.toLowerCase().includes('permission')) {
          userFriendly = 'Your session may have expired. Please try logging out and logging back in.';
        } else {
          userFriendly = err.message;
        }
      }
      setMessage({ text: userFriendly, type: 'error' });
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/track" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-black transition-colors group">
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Locker
          </Link>
          <Button variant="outline" onClick={handleSignOut} className="text-sm py-2 px-4 border-red-600 text-red-600 hover:bg-red-50 rounded-none">
            Sign Out
          </Button>
        </div>

        <div className="bg-white border border-gray-200 p-10 md:p-14 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-32 bg-black -z-0" />
          
          <div className="relative z-10 flex flex-col items-center mb-10">
            <div className="w-24 h-24 bg-white rounded-none flex items-center justify-center text-4xl font-bold text-black border-4 border-gray-200 mb-4 uppercase">
              {formData.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <h1 className="text-3xl font-bold text-black tracking-tight">{formData.full_name || 'Your Profile'}</h1>
            <p className="text-gray-500 font-medium mt-1">{user?.email}</p>
            {profile?.role === 'admin' && (
              <span className="mt-3 px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-widest border border-gray-800">
                Admin
              </span>
            )}
          </div>

          {message && (
            <div className={`mb-8 p-4 text-sm border font-medium ${
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
                  className="rounded-none border-gray-300 focus:border-black focus:ring-black bg-white"
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
                  className="rounded-none border-gray-300 focus:border-black focus:ring-black bg-white"
                />
              </div>
            </div>

            <div>
              <Label>Primary Delivery Location</Label>
              <select 
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-white border border-gray-300 rounded-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all font-medium text-black appearance-none"
              >
                <option value="Ghana">Accra, Ghana (Local Delivery / Pickup)</option>
                <option value="USA">Philadelphia, USA (US Hub Pickup)</option>
              </select>
            </div>

            <div className="pt-6">
              <Button type="submit" isLoading={saving} className="w-full py-5 text-lg rounded-none bg-black text-white hover:bg-gray-800 border-none">
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
