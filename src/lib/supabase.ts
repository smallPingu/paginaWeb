import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

type CookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: 'lax' | 'none' | 'strict';
  secure?: boolean;
};

type CookieItem = {
  name: string;
  value: string;
};

type CookieStore = {
  getAll: () => CookieItem[];
  setAll: (cookies: Array<CookieItem & { options?: CookieOptions }>) => void;
};

export const SUPABASE_URL = import.meta.env.SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY;
export const hasSupabaseEnv = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const isProduction = import.meta.env.PROD;

function assertSupabaseEnv() {
  if (!hasSupabaseEnv) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.');
  }
}

function mapCookieOptions(options?: CookieOptions) {
  if (!options) return undefined;

  return {
    domain: options.domain,
    expires: options.expires,
    httpOnly: options.httpOnly ?? true,
    maxAge: options.maxAge,
    path: options.path ?? '/',
    sameSite: options.sameSite ?? 'lax',
    secure: options.secure ?? isProduction,
  };
}

function createCookieStore(cookies: AstroCookies): CookieStore {
  return {
    getAll: () => cookies
      .headers()
      .map((cookie) => ({
        name: cookie.name,
        value: cookie.value,
      })),
    setAll: (items) => {
      for (const { name, value, options } of items) {
        cookies.set(name, value, mapCookieOptions(options));
      }
    },
  };
}

export function createSupabaseServerClient(cookies: AstroCookies) {
  assertSupabaseEnv();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: createCookieStore(cookies),
  });
}

export function createSupabaseBrowserClient() {
  assertSupabaseEnv();

  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
