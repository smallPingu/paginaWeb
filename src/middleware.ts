import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient, hasSupabaseEnv } from './lib/supabase';

export const onRequest = defineMiddleware(async ({ cookies, locals }, next) => {
  if (!hasSupabaseEnv) {
    locals.supabase = null;
    locals.user = null;
    return next();
  }

  const supabase = createSupabaseServerClient(cookies);
  const { data: { user } } = await supabase.auth.getUser();

  locals.supabase = supabase;
  locals.user = user;

  return next();
});
