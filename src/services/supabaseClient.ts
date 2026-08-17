import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variable retrieval (Vite imports or process.env fallback)
const env = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};
const supabaseUrl = 
  env.VITE_SUPABASE_URL || 
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || 
  '';

const supabaseAnonKey = 
  env.VITE_SUPABASE_ANON_KEY || 
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) || 
  '';

export const isSupabaseClientConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-supabase-project')
);

/**
 * Singleton Browser Supabase Client for frontend authentication and database interaction.
 * Returns null if Supabase environment keys are not configured.
 */
export const supabase: SupabaseClient | null = isSupabaseClientConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
