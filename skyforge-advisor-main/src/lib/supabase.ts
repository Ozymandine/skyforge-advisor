// src/lib/supabase.ts
// Lazy Supabase clients. Returns null when env is not configured so all
// callers degrade to the local/file fallback instead of crashing.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getEnv, supabaseConfigured } from "./env";

let serverClient: SupabaseClient | null = null;
let browserClient: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient | null {
  if (typeof window !== "undefined") return null;
  if (!supabaseConfigured()) return null;
  if (serverClient) return serverClient;
  const env = getEnv();
  serverClient = createClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-client-info": "skyforge-advisor/1.0" } },
  });
  return serverClient;
}

export function getSupabaseBrowser(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  const url =
    import.meta.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"];
  const key =
    import.meta.env["VITE_SUPABASE_ANON_KEY"] ?? process.env["SUPABASE_ANON_KEY"];
  if (!url || !key) return null;
  if (browserClient) return browserClient;
  browserClient = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: { headers: { "x-client-info": "skyforge-advisor/1.0" } },
  });
  return browserClient;
}

/** For tests: reset cached clients. */
export function __resetSupabaseClients(): void {
  serverClient = null;
  browserClient = null;
}
