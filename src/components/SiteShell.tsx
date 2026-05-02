'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchRole(session.user.id);
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      fetchRole(user.id);
    }
  };

  const fetchRole = async (userId: string) => {
    const { data } = await supabase.from('route233_profiles').select('role').eq('id', userId).single();
    if (data) setRole(data.role);
  };

  // Don't show complex nav on login/signup to keep it clean
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-slate-900 tracking-tighter">
          ROUTE<span className="text-blue-600">233</span>
        </Link>
        
        {!isAuthPage && (
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href={role === 'admin' ? '/admin/dashboard' : '/track'} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors py-2 px-4">
                  {role === 'admin' ? 'Dashboard' : 'My Tracking'}
                </Link>
                <button 
                  onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
                  className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors px-4"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors py-2 px-4">
                  Sign In
                </Link>
                <Link href="/signup">
                  <Button variant="outline" className="text-sm border-slate-200 rounded-full px-6">
                    Register
                  </Button>
                </Link>
              </>
            )}
            <div className="h-4 w-[1px] bg-slate-200 mx-2" />
            <Link href="/inquire">
              <Button className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-500/20">
                Get a Quote
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="py-20 bg-white border-t border-slate-100 text-center">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-2xl font-black text-slate-900 tracking-tighter mb-4">
          ROUTE<span className="text-blue-600">233</span>
        </div>
        <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed mb-8">
          Professional logistics and sourcing bridging the gap between US retailers and the Ghanaian market.
        </p>
        <div className="flex justify-center gap-8 text-sm font-bold text-slate-400 mb-12">
          <Link href="/track" className="hover:text-blue-600">Track Order</Link>
          <Link href="/inquire" className="hover:text-blue-600">New Request</Link>
          <Link href="/terms" className="hover:text-blue-600">Terms</Link>
          <Link href="/contact" className="hover:text-blue-600">Contact</Link>
        </div>
        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
          &copy; 2026 Akanexus Studio &bull; Philly &bull; Delaware &bull; Accra
        </p>
      </div>
    </footer>
  );
}
