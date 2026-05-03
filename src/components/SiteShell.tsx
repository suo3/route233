'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchRole(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      authListener.subscription.unsubscribe();
    };
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
    if (data) setIsAdmin(data.role === 'admin');
  };

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isHomePage = pathname === '/';

  // For the dark hero on home page, we want a dark nav that becomes light/blur on scroll
  const navClass = isHomePage && !scrolled
    ? "bg-transparent border-transparent"
    : "bg-white/80 backdrop-blur-md border-slate-100 shadow-sm";

  const textClass = isHomePage && !scrolled ? "text-white" : "text-slate-900";
  const subTextClass = isHomePage && !scrolled ? "text-slate-400" : "text-slate-600";

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${navClass}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className={`text-2xl font-black tracking-tighter ${textClass}`}>
          ROUTE<span className="text-blue-500">233</span>
        </Link>
        
        {!isAuthPage && (
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href={isAdmin ? '/admin/dashboard' : '/track'} className={`text-sm font-bold transition-colors py-2 px-4 ${subTextClass} hover:text-blue-500`}>
                  {isAdmin ? 'Dashboard' : 'My Locker'}
                </Link>
                <Link href="/profile" className={`text-sm font-bold transition-colors py-2 px-4 ${subTextClass} hover:text-blue-500`}>
                  Profile
                </Link>
                <button 
                  onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
                  className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors px-4"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={`text-sm font-bold transition-colors py-2 px-4 ${subTextClass} hover:text-blue-500`}>
                  Sign In
                </Link>
                <Link href="/signup">
                  <Button variant="outline" className={`text-sm rounded-full px-6 transition-all ${
                    isHomePage && !scrolled ? 'border-slate-700 text-white hover:bg-slate-800' : 'border-slate-200'
                  }`}>
                    Register
                  </Button>
                </Link>
              </>
            )}
            <div className={`h-4 w-[1px] mx-2 ${isHomePage && !scrolled ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <Link href="/inquire">
              <Button className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 border-none">
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
    <footer className="py-24 bg-slate-900 border-t border-white/5 text-center">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-2xl font-black text-white tracking-tighter mb-4">
          ROUTE<span className="text-blue-600">233</span>
        </div>
        <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed mb-10">
          Professional logistics and sourcing bridging the gap between US retailers and the Ghanaian market.
        </p>
        <div className="flex justify-center gap-10 text-sm font-bold text-slate-500 mb-12">
          <Link href="/track" className="hover:text-blue-400">Track Order</Link>
          <Link href="/inquire" className="hover:text-blue-400">New Request</Link>
          <Link href="/terms" className="hover:text-blue-400">Terms</Link>
          <Link href="/contact" className="hover:text-blue-400">Contact</Link>
        </div>
        <p className="text-slate-600 text-[10px] uppercase tracking-[0.2em] font-bold">
          &copy; 2026 Akanexus Studio &bull; Philadelphia &bull; Delaware &bull; Accra
        </p>
      </div>
    </footer>
  );
}
