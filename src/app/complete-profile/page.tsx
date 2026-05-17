'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button, Input, Label } from '@/components/ui';

function CompleteProfileContent() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      setFullName(user.user_metadata?.full_name || user.user_metadata?.name || '');
      
      // Check if they already have a phone number to prevent page entry
      const { data: profile } = await supabase
        .from('route233_profiles')
        .select('phone_number')
        .eq('id', user.id)
        .single();
      
      if (profile?.phone_number) {
        router.push('/track');
      }
    };
    fetchUser();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');

    // Normalize phone number (standard format for Ghana starting with 0 or +233)
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '233' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.slice(1);
    }

    // 1. Update the local DB profile with full name and phone number
    const { error: profileError } = await supabase
      .from('route233_profiles')
      .upsert({
        id: user.id,
        full_name: fullName || user.email?.split('@')[0] || 'Valued Customer',
        phone_number: formattedPhone,
        role: 'customer'
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      let userFriendlyMsg = 'We encountered a small problem setting up your profile. Please check your connection and try again, or contact our support team.';
      
      if (profileError.message?.toLowerCase().includes('policy') || profileError.message?.toLowerCase().includes('permission')) {
        userFriendlyMsg = 'Session expired or insufficient permissions. Please try logging out and logging back in.';
      }
      
      setError(userFriendlyMsg);
      setLoading(false);
      return;
    }

    // 2. Trigger the welcome WhatsApp notification via server API route
    try {
      await fetch('/api/notifications/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formattedPhone,
          name: fullName || 'there',
        }),
      });
    } catch (err) {
      console.warn('Welcome WhatsApp notification failed:', err);
    }

    setLoading(false);
    router.push('/track?message=Welcome to Route233! WhatsApp tracking notifications are now active.&type=success');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md bg-white border border-gray-200 p-12">
        <div className="text-center mb-8">
          <span className="text-2xl font-black text-black tracking-tighter mb-4 inline-block">
            ROUTE233
          </span>
          <h1 className="text-3xl font-bold text-black tracking-tight">Complete Setup</h1>
          <p className="text-gray-500 mt-2 text-sm">Connect your profile to receive instant tracking updates</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-none text-sm border bg-red-50 border-red-100 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <Label>Full Name</Label>
            <Input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Kwesi Mensah"
              className="rounded-none border-gray-300 focus:border-yellow-400"
            />
          </div>
          
          <div>
            <Label>Ghana Phone Number (WhatsApp)</Label>
            <Input
              required
              type="tel"
              placeholder="e.g. 024 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-none border-gray-300 focus:border-yellow-400"
            />
            <p className="text-gray-400 text-[10px] mt-2 leading-relaxed">
              We send your Delaware/Philly landed cost quotes, customs status changes, and MoMo receipt alerts here.
            </p>
          </div>

          <Button type="submit" isLoading={loading} className="w-full py-4 text-base font-bold bg-black text-white hover:bg-gray-800 rounded-none border-none">
            Save & Enter Locker
          </Button>
        </form>
      </div>
    </main>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full" />
      </div>
    }>
      <CompleteProfileContent />
    </Suspense>
  );
}
