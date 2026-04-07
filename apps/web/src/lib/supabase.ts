import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: typeof window !== "undefined" ? localStorage : undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return _supabase;
}

// Re-export as a getter so existing `supabase` imports keep working at runtime
// but don't crash during static page generation
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabase(), prop, receiver);
  },
});
