'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button, Input, Label } from '@/components/ui';
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      window.location.href = '/locker';
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
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Access your digital locker</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
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
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" isLoading={loading} className="w-full py-4 text-lg">
            Sign In
          </Button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-600 font-bold hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </main>
  );
}
