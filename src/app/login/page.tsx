'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button, Input, Label } from '@/components/ui';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');

  useEffect(() => {
    const msg = searchParams.get('message');
    const type = searchParams.get('type') as 'error' | 'success';
    if (msg) {
      setMessage(msg);
      if (type) setMessageType(type);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let friendlyError = error.message;
      if (error.message?.toLowerCase().includes('invalid login credentials') || error.message?.toLowerCase().includes('invalid credentials')) {
        friendlyError = "We couldn't find an account matching those details. Please check your email or password, or sign up if you don't have an account!";
      } else if (error.message?.toLowerCase().includes('email not confirmed') || error.message?.toLowerCase().includes('email not verified')) {
        friendlyError = "Please verify your email address. We sent a confirmation link to your inbox—please check your email (and spam folder) to activate your account.";
      }
      setMessage(friendlyError);
    } else if (user) {
      console.log('Login successful for:', user.email);
      
      // Fetch profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('route233_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        // Fallback: Default to track if profile check fails
        router.push('/track');
      } else if (profile?.role === 'admin') {
        console.log('Admin detected, redirecting...');
        router.push('/admin/dashboard');
      } else {
        console.log('Customer detected, redirecting...');
        router.push('/track');
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/track`,
      }
    });

    if (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md bg-white border border-gray-200 p-12">
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-black text-black tracking-tighter mb-4 inline-block">
            233 LOGISTICS
          </Link>
          <h1 className="text-3xl font-bold text-black">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Access your digital locker</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-none text-sm border ${
            messageType === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'
          }`}>
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
              className="rounded-none border-gray-300 focus:border-black focus:ring-black"
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
              className="rounded-none border-gray-300 focus:border-black focus:ring-black"
            />
          </div>
          <Button type="submit" isLoading={loading} className="w-full py-4 text-lg bg-black text-white hover:bg-gray-800 rounded-none border-none">
            Sign In
          </Button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <span className="relative bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">or</span>
        </div>

        <Button 
          type="button" 
          onClick={handleGoogleSignIn}
          className="w-full py-4 text-base border border-gray-300 !bg-white !text-black hover:border-black rounded-none flex items-center justify-center gap-3 transition-colors active:scale-[0.98]"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>

        <p className="mt-8 text-center text-gray-500 text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="text-black font-bold hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
