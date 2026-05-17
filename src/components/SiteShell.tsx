'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
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

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-black border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tight text-white uppercase">
          233<span className="text-yellow-400"> Logistics</span>
        </Link>
        
        {!isAuthPage && (
          <>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <Link href={isAdmin ? '/admin/dashboard' : '/track'} className="text-sm font-medium transition-colors py-2 px-4 text-white hover:text-gray-300">
                    {isAdmin ? 'Dashboard' : 'My Locker'}
                  </Link>
                  <Link href="/profile" className="text-sm font-medium transition-colors py-2 px-4 text-white hover:text-gray-300">
                    Profile
                  </Link>
                  <button 
                    onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
                    className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-4"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium transition-colors py-2 px-4 text-white hover:text-gray-300">
                    Log in
                  </Link>
                  <Link href="/signup">
                    <Button variant="outline" className="!bg-transparent !border-white !text-white hover:!bg-white hover:!text-black text-sm rounded-none px-6 py-2 font-medium">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
              <div className="h-6 w-[1px] mx-2 bg-white/20" />
              <Link href="/inquire">
                <Button variant="accent" className="px-6 py-2 rounded-none text-sm font-bold border-none transition-all uppercase tracking-widest">
                  Request Quote
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-yellow-400 p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              )}
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && !isAuthPage && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col p-8">
          <div className="flex justify-between items-center mb-12">
            <span className="text-2xl font-black tracking-tight text-white uppercase">
              233<span className="text-yellow-400"> Logistics</span>
            </span>
            <button 
              className="text-yellow-400 p-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex flex-col gap-8">
            {user ? (
              <>
                <Link 
                  href={isAdmin ? '/admin/dashboard' : '/track'} 
                  className="text-4xl font-bold text-white hover:text-yellow-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {isAdmin ? 'Dashboard' : 'My Locker'}
                </Link>
                <Link 
                  href="/profile" 
                  className="text-4xl font-bold text-white hover:text-yellow-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    supabase.auth.signOut().then(() => window.location.href = '/');
                  }}
                  className="text-4xl font-bold text-left text-gray-500 hover:text-red-500 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-4xl font-bold text-white hover:text-yellow-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link 
                  href="/signup" 
                  className="text-4xl font-bold text-white hover:text-yellow-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
            <div className="h-[2px] w-12 bg-yellow-400 my-4" />
            <Link 
              href="/inquire"
              className="text-4xl font-bold text-yellow-400 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Request Quote
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="py-24 bg-black text-center">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-2xl font-black text-white tracking-tight mb-4">
          233 LOGISTICS
        </div>
        <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed mb-10 font-medium">
          Professional logistics and sourcing bridging the gap between US retailers and the Ghanaian market.
        </p>
        <div className="flex justify-center gap-10 text-sm font-medium text-white mb-12">
          <Link href="/track" className="hover:text-gray-300">Track Order</Link>
          <Link href="/inquire" className="hover:text-gray-300">New Request</Link>
          <Link href="/terms" className="hover:text-gray-300">Terms</Link>
          <Link href="/contact" className="hover:text-gray-300">Contact</Link>
        </div>
        <p className="text-gray-500 text-xs font-medium">
          &copy; 2026 Akanexus Studio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
