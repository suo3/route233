import { createClient } from '@supabase/supabase-js';

// Defer process.env access until runtime to prevent Cloudflare Edge Worker crashes
let clientInstance: any = null;

export const getSupabaseClient = () => {
  if (clientInstance) return clientInstance;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Missing Supabase environment variables. Check your .env file.');
  }
  
  clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  return clientInstance;
};

// Export a proxy so existing imports like `import { supabase } from ...` work seamlessly
// without evaluating `process.env` at module load time.
export const supabase = new Proxy({}, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    const value = client[prop];
    // Ensure methods like .from() or .auth.getSession() keep the correct 'this' context
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
}) as any;

// For admin operations, use service role key in server-side routes
export const getAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.warn('Missing SUPABASE_SERVICE_ROLE_KEY. Admin features will not work.');
  }
  return createClient(supabaseUrl, serviceRoleKey || '');
};