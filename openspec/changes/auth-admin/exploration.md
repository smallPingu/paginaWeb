# Exploration: auth-admin

## Current State

### Supabase Infrastructure Already in Place

**Client (`src/lib/supabase.ts`)**
- Browser client: `createSupabaseBrowserClient()` — returns `SupabaseClient` using `@supabase/ssr`
- Server client: `createSupabaseServerClient(cookies)` — wraps `createServerClient` with Astro cookie adapter
- Both clients require `SUPABASE_URL` and `SUPABASE_ANON_KEY` env vars
- `hasSupabaseEnv` boolean guard — allows graceful degradation when env vars are missing
- Cookie handling: custom `CookieStore` adapter maps Astro cookies to Supabase's expected interface

**Middleware (`src/middleware.ts`)**
- Runs on every request (including prerendered pages — per SSR spec)
- Creates server client, calls `supabase.auth.getUser()`
- Populates `locals.supabase` and `locals.user` with the authenticated user object
- Graceful fallback: when `hasSupabaseEnv` is false, sets both to `null`

**Type Declarations (`src/env.d.ts`)**
- `App.Locals.supabase`: `SupabaseClient | null`
- `App.Locals.user`: `SupabaseUser | null` (only `id` and optional `email`)
- `ImportMetaEnv`: `SUPABASE_URL` and `SUPABASE_ANON_KEY`

**Dependencies (`package.json`)**
- `@supabase/ssr`: `^0.6.1`
- `@supabase/supabase-js`: `^2.57.2`
- No `@supabase/auth-helpers-astro` — using the newer SSR-first approach

**Environment (`.env.example`)**
- Documents `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- No `.env` file exists — env vars are not configured locally
- No `SUPABASE_SERVICE_ROLE_KEY` documented (needed for admin operations)

### Existing Routes

All public routes are prerendered:
- `/`, `/en/`, `/uk/` — home pages
- `/blog/`, `/en/blog/`, `/uk/blog/` — blog index
- `/galeria/`, `/en/galeria/`, `/uk/galeria/` — gallery index
- `/contacto/`, `/en/contacto/`, `/uk/contacto/` — contact

SSR routes (no prerender):
- `/blog/[...slug]`, `/en/blog/[...slug]`, `/uk/blog/[...slug]` — blog post detail

**No existing routes for**: login, register, admin, dashboard, or any protected area.

### Decap CMS Conflict

- `public/admin/config.yml` serves Decap CMS at `/admin/`
- Uses GitHub backend with Netlify auth flow
- This is a **hard conflict** — the admin panel cannot also be at `/admin/`

### i18n Structure

- Three locales: `es` (default), `en`, `uk`
- `prefixDefaultLocale: false` — Spanish routes have no prefix
- Translation keys use dot notation (e.g., `nav.inicio`, `site.title`)
- Auth pages will need translations for all three locales

## What's Missing

1. **Login page** — no route, no form, no Supabase auth call
2. **Register page** — no route, no form, no Supabase auth call
3. **Admin panel** — no protected route, no dashboard UI
4. **Auth guard middleware** — current middleware only populates `user`, doesn't redirect
5. **Role system** — no `role` field on user, no profiles table, no role check
6. **Supabase project** — no real project created (only `.env.example` with placeholder values)
7. **Env vars** — `.env` file doesn't exist locally
8. **Server-side auth helper** — no reusable function to get user in SSR pages (middleware sets `locals.user` but pages need to read it)
9. **Client-side auth helper** — no utility for login/logout/register calls from browser
10. **Session persistence** — Supabase handles this via cookies, but no logout button exists

## Approaches

### 1. Simple Auth (Login/Register + Admin Panel)

**How it works:**
- Login at `/login`, register at `/register` (SSR pages with client-side Supabase calls)
- Admin panel at `/admin/panel` (SSR page, protected by middleware redirect)
- Role stored in a `public.profiles` table with a `role` column (`'student'` | `'teacher'`)
- Middleware checks role for `/admin/*` routes and redirects non-teachers
- No custom claims, no complex RBAC

**Pros:**
- Minimal Supabase config (just a table)
- Easy to understand and maintain
- Works with free tier
- Fast to implement

**Cons:**
- Role check requires a DB query on every admin request (or cached in cookie)
- Limited extensibility (adding more roles means more queries)
- No fine-grained permissions

**Effort:** Low-Medium (3-4 tasks)

### 2. Full RBAC with Custom Claims

**How it works:**
- Same login/register flow
- Admin panel uses Supabase custom claims (JWT metadata) for role
- Middleware reads role from JWT — no DB query needed
- Roles: `student`, `teacher`, potentially more
- Supabase Edge Function or trigger to set claims on user creation

**Pros:**
- Fast role checks (JWT-based, no DB query)
- Scalable for more roles/permissions
- Industry-standard pattern

**Cons:**
- Requires Supabase Edge Function or database trigger setup
- More complex initial setup
- Custom claims require Supabase Pro plan for Edge Functions (or workaround with database triggers)
- Overkill for a drawing classes site with one teacher

**Effort:** Medium-High (5-6 tasks)

### 3. Hybrid: Simple Auth + Cookie Cache

**How it works:**
- Same as Simple Auth
- Role fetched from `profiles` table once, cached in an HTTP-only cookie
- Middleware checks cookie first, falls back to DB query
- Cookie updated on login and role change

**Pros:**
- No DB query on most requests
- Still simple to implement
- Works with free tier

**Cons:**
- Cookie can get stale if role changes
- Slightly more complex than pure Simple

**Effort:** Medium (4 tasks)

## Recommendation

**Approach 1: Simple Auth** — this is a drawing classes site with one teacher and students. Full RBAC is overkill. The performance cost of a DB query for admin routes is negligible (one teacher, infrequent admin access). Keep it simple.

For the admin route conflict:
- Move Decap CMS to `/cms/` or remove it entirely (it depends on Netlify auth, which won't work with Supabase)
- Use `/admin/` for the new admin panel

## Affected Areas

### New Files to Create

| Path | Purpose |
|------|---------|
| `src/pages/login.astro` | Login page (SSR) |
| `src/pages/register.astro` | Register page (SSR) |
| `src/pages/admin/index.astro` | Admin dashboard (SSR, protected) |
| `src/pages/admin/blog.astro` | Blog management (SSR, protected) |
| `src/pages/admin/gallery.astro` | Gallery management (SSR, protected) |
| `src/components/auth/LoginForm.astro` | Login form component |
| `src/components/auth/RegisterForm.astro` | Register form component |
| `src/components/auth/AuthGuard.astro` | Redirect logic for unauthenticated users |
| `src/components/admin/AdminLayout.astro` | Admin layout wrapper |
| `src/components/admin/AdminNav.astro` | Admin navigation sidebar |
| `src/lib/auth.ts` | Server-side auth helpers (requireRole, getUser) |
| `src/lib/auth-client.ts` | Client-side auth helpers (login, register, logout) |
| `src/middleware/auth.ts` | Auth-specific middleware (role guard for /admin) |
| `supabase/migrations/001_profiles.sql` | Profiles table migration |

### Files to Modify

| Path | Change |
|------|--------|
| `src/middleware.ts` | Add auth guard import for `/admin/*` routes |
| `src/env.d.ts` | Add `role` to `SupabaseUser` type, add `profiles` table types |
| `src/layouts/Layout.astro` | Add login/logout button in header when user is authenticated |
| `.env.example` | Add `SUPABASE_SERVICE_ROLE_KEY` (optional, for admin ops) |
| `public/admin/config.yml` | Move to `/cms/` path or remove |
| `src/i18n/es.json` | Add auth-related translation keys |
| `src/i18n/en.json` | Add auth-related translation keys |
| `src/i18n/uk.json` | Add auth-related translation keys |

### Files Unchanged

- All existing public pages (no changes needed)
- `src/lib/supabase.ts` (already works for auth)
- `astro.config.mjs` (no changes needed)
- `package.json` (dependencies already installed)

## Risks

1. **Supabase project doesn't exist** — The user needs to create a Supabase project, get URL and anon key, and create the `profiles` table. This is a blocker for testing.

2. **Env vars not set locally** — No `.env` file exists. Auth features will throw errors until configured.

3. **Decap CMS conflict** — Current `/admin/` serves Decap CMS. Must either move it to `/cms/` or remove it. Decap CMS depends on Netlify auth, which conflicts with Supabase auth.

4. **i18n scope** — Auth pages need translations in all three locales. This is manageable but adds scope.

5. **Role bootstrapping** — The teacher account needs to be created manually in Supabase, then their `profiles` row set to `role: 'teacher'`. No automated admin creation flow.

6. **No tests** — The project has no test infrastructure. Auth is security-sensitive — manual testing will be critical.

## Ready for Proposal

**Yes** — the exploration is complete. The recommendation is clear (Simple Auth approach), affected areas are identified, and risks are documented. The orchestrator should proceed to `sdd-propose` and inform the user about the Supabase project setup requirement.
