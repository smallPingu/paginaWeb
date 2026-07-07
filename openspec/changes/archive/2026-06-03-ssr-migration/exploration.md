# Exploration: SSR Migration

## Current State

The project has `output: 'static'` in `astro.config.mjs` with `@astrojs/node` adapter in standalone mode. Supabase SSR code (middleware, client, type declarations) is fully written but **completely inert** — Astro's static output never executes middleware or server-side logic.

### What's Blocked

- `src/middleware.ts` — creates Supabase server client, populates `locals.user` and `locals.supabase`. Never runs.
- `src/lib/supabase.ts` — `createSupabaseServerClient()` uses `@supabase/ssr` cookie adapter. Never called at runtime.
- `src/env.d.ts` — declares `App.Locals` with `supabase` and `user` fields. Dead types.

### Page Inventory

| Route | SSR Needed? | Notes |
|-------|-------------|-------|
| `/` (es landing) | No — prerender | Static content |
| `/en/`, `/uk/` | No — prerender | Static content |
| `/blog`, `/en/blog`, `/uk/blog` | No — prerender | Content collection index |
| `/blog/[...slug]`, `/en/blog/[...slug]`, `/uk/blog/[...slug]` | No — prerender | Uses `getStaticPaths()` + `import.meta.glob` |
| `/contacto`, `/en/contacto`, `/uk/contacto` | Depends | Currently Netlify Forms (static); needs API route if moving away from Netlify |
| `/galeria`, `/en/galeria`, `/uk/galeria` | No — prerender | Hardcoded placeholders, content collection empty |
| `/login`, `/register` | **Yes — SSR** | Does not exist yet |
| `/admin` | **Yes — SSR** | Decap CMS at `public/admin/`, needs auth gate |
| `/api/*` | **Yes — SSR** | Does not exist yet (calendar/reservas later) |

### i18n Routing Interaction

Config: `prefixDefaultLocale: false`, `redirectToDefaultLocale: false`.

- Spanish pages: `/`, `/blog`, `/blog/hello`
- English pages: `/en/`, `/en/blog`, `/en/blog/hello`
- Ukrainian pages: `/uk/`, `/uk/blog`, `/uk/blog/hello`

In Astro 5 SSR mode, `export const prerender = true` on a page makes it static. The i18n routing should continue working with prerendered pages — no conflict. The issue is with `getStaticPaths()` which is **static-only** and will fail in server mode.

### Blog Route Problem

All three `[...slug].astro` files (es/en/uk) use:
```js
export async function getStaticPaths() {
  const rawModules = import.meta.glob('../../content/blog/*.md', { eager: true });
  // ...filter by locale...
}
```

This is a static-only API. In SSR, dynamic routes resolve at request time — no `getStaticPaths()` needed. The content can be queried via `getCollection()` at request time instead.

### Netlify Form Dependency

`src/components/ContactoContent.astro` uses:
- `data-netlify="true"`, `netlify`, `name="contact"` attributes
- Hidden `form-name` field
- Client-side `fetch('/')` POST

Netlify Forms only work with static HTML forms processed at deploy time. In SSR, the form POST hits the Node server, not Netlify's form handler. Need an API route or alternative (Supabase, external service).

### Decap CMS Dependency

`public/admin/config.yml` uses:
- `base_url: https://api.netlify.com`
- `auth_endpoint: auth`

This is Netlify's OAuth proxy for CMS login. In SSR mode, this still works (it's a client-side flow to Netlify's API), but the admin panel itself may need protection if you want only authenticated users to access it.

## Affected Areas

- `astro.config.mjs` — change `output: 'static'` to `output: 'server'`
- `src/pages/blog/[...slug].astro` — replace `getStaticPaths()` with dynamic content query
- `src/pages/en/blog/[...slug].astro` — same
- `src/pages/uk/blog/[...slug].astro` — same
- `src/pages/contacto.astro` — add `export const prerender = true` (or convert form)
- `src/pages/en/contacto.astro` — same
- `src/pages/uk/contacto.astro` — same
- `src/pages/index.astro` — add `export const prerender = true`
- `src/pages/en/index.astro` — same
- `src/pages/uk/index.astro` — same
- `src/pages/galeria/index.astro` — add `export const prerender = true`
- `src/pages/en/galeria/index.astro` — same
- `src/pages/uk/galeria/index.astro` — same
- `src/pages/blog/index.astro` — add `export const prerender = true`
- `src/pages/en/blog/index.astro` — same
- `src/pages/uk/blog/index.astro` — same
- `src/components/ContactoContent.astro` — replace Netlify form with API route or keep with caveat
- `public/admin/config.yml` — may need auth gate update
- **New**: `src/pages/login.astro` — SSR auth page
- **New**: `src/pages/register.astro` — SSR auth page
- **New**: `src/pages/api/contact.ts` — API route for form handling

## Approaches

### 1. Full Migration at Once

Change output to `server`, add all route guards, auth pages, API routes, fix blog routes, and replace Netlify form — all in one change.

| Aspect | Detail |
|--------|--------|
| Pros | Clean single transition, no intermediate broken states |
| Cons | Large change surface, harder to verify incrementally, higher risk |
| Effort | Medium-High |

### 2. Incremental (Recommended)

Phase the work:

1. **Phase A**: Change output to `server`, add `prerender = true` to all existing pages, fix blog `[...slug]` routes to use dynamic content queries. Verify build works.
2. **Phase B**: Add login/register pages (SSR), protect admin. Verify auth flow works.
3. **Phase C**: Add API routes (contact form, later calendar/reservas). Replace Netlify form dependency.

| Aspect | Detail |
|--------|--------|
| Pros | Each phase is independently verifiable, lower risk, easier to debug |
| Cons | Three commits instead of one, slightly more planning |
| Effort | Low per phase, Medium total |

## Recommendation

**Approach 2: Incremental.**

Reasons:
- The codebase is small (~20 pages) but the migration touches a fundamental config. Phasing lets you verify each piece.
- Blog `[...slug]` routes are the trickiest part — they use `getStaticPaths()` which is incompatible with SSR. Isolating this change makes it easier to test.
- Supabase auth pages are new features, not migration work. Mixing them with the output mode change muddies the diff.
- Netlify form replacement is a separate concern (deployment target change) that shouldn't block the SSR migration.

## Risks

- **`getStaticPaths()` in server mode**: Astro 5 will error if any page uses `getStaticPaths()` in server mode. All three `[...slug].astro` files MUST be updated in Phase A.
- **i18n + prerender**: Astro 5's `prerender = true` pages with i18n routing should work, but the interaction between `prefixDefaultLocale: false` and prerender needs verification at build time. Test with `npm run build` early.
- **Netlify form**: If you deploy to a non-Netlify host, the contact form breaks regardless of SSR. This is a pre-existing issue that SSR makes visible.
- **Decap CMS auth**: The Netlify OAuth proxy works from the client side, so SSR doesn't break it. But if you want to protect `/admin` with Supabase auth, you need middleware logic (not just client-side checks).
- **`import.meta.glob` in server mode**: Still works in Astro 5 server mode for content collection queries, but `getStaticPaths()` wrapping it is the blocker. The glob itself is fine.
- **Adapter**: `@astrojs/node` in standalone mode is correct for SSR. No change needed there.
- **Environment variables**: `SUPABASE_URL` and `SUPABASE_ANON_KEY` need to be set at runtime (not build time) in SSR mode. With `output: 'static'`, these were baked in at build. With `output: 'server'`, they're read at request time from `process.env`. Verify `.env` setup.

## Ready for Proposal

Yes. The exploration is complete. The orchestrator should:
1. Proceed to `sdd-propose` with the incremental approach
2. Tell the user that Phase A (output switch + blog route fix) is the critical first step
3. Flag the Netlify form dependency as a separate decision point (keep Netlify deploy? or migrate form handling?)
