"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { supabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

let singleton: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!supabaseConfig.configured) return null;
  if (singleton) return singleton;

  singleton = createClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return singleton;
}
