// lib/supabase.ts – demo-safe fallback client
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Fallback to dummy values if env vars are not defined
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://dummy.supabase.co';

const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'dummy';

/**
 * Browser-side Supabase client (use inside client components)
 */
export const supabaseBrowser = (): SupabaseClient => {
  return createClient(url, anon, {
    auth: { persistSession: false },
  });
};

/**
 * Server-side Supabase client (use in route handlers or server actions)
 */
export const supabaseServer = (): SupabaseClient => {
  return createClient(url, anon, {
    auth: { persistSession: false },
  });
};