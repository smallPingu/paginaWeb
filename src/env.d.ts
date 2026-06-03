/// <reference path="../.astro/types.d.ts" />

type SupabaseUser = {
  id: string;
  email?: string;
};

declare namespace App {
  interface Locals {
    supabase: import('@supabase/supabase-js').SupabaseClient | null;
    user: SupabaseUser | null;
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
