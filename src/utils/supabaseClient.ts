import { createClient } from '@supabase/supabase-js';

// Sanitize credentials to remove stray backticks, quotes, or whitespace that might be injected by deployment tools
const sanitizeEnv = (val: string | undefined) => (val || '').trim().replace(/^[`"']|[`"']$/g, '');

const supabaseUrl = sanitizeEnv(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = sanitizeEnv(import.meta.env.VITE_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. CRM features may not function correctly.');
} else {
  // Diagnostique pour le problème WebSocket/Realtime
  console.log('Supabase initialized for:', supabaseUrl.substring(0, 30) + '...');
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : {} as any;
