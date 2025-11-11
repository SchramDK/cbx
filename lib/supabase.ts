

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser-side Supabase client (use inside client components)
 */
export const supabaseBrowser = (): SupabaseClient => {
  return createClient(url, anon);
};

/**
 * Server-side Supabase client (use in route handlers or server actions)
 * For the demo we keep it simple without cookie binding.
 */
export const supabaseServer = (): SupabaseClient => {
  return createClient(url, anon);
};