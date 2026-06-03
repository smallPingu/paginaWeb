# Supabase SSR/Auth Setup (Slice 1)

This project now uses Astro `output: 'static'` + Node adapter. In Astro 5 this replaces the old hybrid behavior, so public pages remain prerendered while server features are available.

## Required environment variables

Set these values before enabling authenticated/private pages:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Both are listed in `.env.example`.

## Current behavior

- Public pages (including i18n blog routes) remain public.
- Middleware initializes Supabase auth context on each request when env vars are present.
- If Supabase env vars are missing, middleware safely falls back to `locals.user = null` and `locals.supabase = null`.

## Next slices

Future slices will add login/logout UX and private route guards (`/calendar`, `/files`) plus DB/RLS integration.
