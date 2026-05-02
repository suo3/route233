import { getAdminClient } from '@/lib/supabase/client';

export async function getExchangeRate() {
  const adminSupabase = getAdminClient();
  
  // 1. Check our database config first
  const { data: config } = await adminSupabase
    .from('route233_config')
    .select('value')
    .eq('key', 'exchange_rate')
    .single();

  const rateConfig = config?.value as { usd_to_ghs: number; auto_update: boolean };
  
  if (rateConfig?.auto_update) {
    // In a real app, you'd fetch from an API like CurrencyBeacon or OpenExchangeRates
    // For now, we return the stored rate but log that it would be dynamic.
    console.log('Fetching live USD/GHS rate...');
  }

  return rateConfig?.usd_to_ghs || 12.50; // Fallback
}
