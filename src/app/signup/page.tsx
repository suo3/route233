'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button, Input, Label } from '@/components/ui';
import Link from 'next/link';

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // 1. Sign up user
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phone,
        }
      }
    });

    if (authError) {
      setMessage(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // 2. Create profile entry (in case trigger isn't set up yet)
      const { error: profileError } = await supabase
        .from('route233_profiles')
        .insert([{
          id: data.user.id,
          full_name: fullName,
          phone_number: phone,
          role: 'customer'
        }]);
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      setMessage('Check your email for the confirmation link!');
    }
    
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 p-12">
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-black text-slate-900 tracking-tighter mb-4 inline-block">
            ROUTE<span className="text-blue-600">233</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Start Sourcing</h1>
          <p className="text-slate-500 mt-2">Create your Route233 account</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-2xl text-sm border ${
            message.includes('Check') ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input 
              required 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Kwesi Mensah"
            />
          </div>
          <div>
            <Label>Ghana Phone Number (WhatsApp)</Label>
            <Input 
              required 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="024 XXX XXXX"
            />
          </div>
          <div>
            <Label>Email Address</Label>
            <Input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
            />
          </div>
          <Button type="submit" isLoading={loading} className="w-full py-4 text-lg mt-4">
            Create Account
          </Button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
