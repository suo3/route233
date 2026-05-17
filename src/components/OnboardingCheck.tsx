'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export function OnboardingCheck() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkOnboarding = async () => {
      // 1. Get current logged in user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Prevent infinite redirect loops on excluded paths
      const isExcluded = 
        pathname === '/complete-profile' || 
        pathname === '/login' || 
        pathname === '/signup' ||
        pathname.startsWith('/api/');

      if (isExcluded) return;

      // 3. Fetch profile to check if phone_number is present and if they are an admin
      const { data: profile, error } = await supabase
        .from('route233_profiles')
        .select('phone_number, role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile onboarding status:', error);
        return;
      }

      // Admin role bypass onboarding requirements
      if (profile?.role === 'admin') {
        return;
      }

      // 4. Redirect if phone_number is missing or empty
      if (!profile || !profile.phone_number) {
        console.log('User profile incomplete (missing phone number). Redirecting to /complete-profile onboarding.');
        router.push('/complete-profile');
      }
    };

    // Initial check
    checkOnboarding();

    // Listen for sign ins to re-trigger check
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        checkOnboarding();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  return null;
}
