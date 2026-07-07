# Proposal: SSR Migration for Drawing Classes Site

## Intent

Migrate from static to SSR output so Supabase auth, middleware, and dynamic routes work. The site currently uses `output: 'static'` which prevents middleware from running, making all Supabase SSR code inert.

## Scope

### In Scope
- Change `output` from `'static'` to `'server'` in astro.config.mjs
- Add `export const prerender = true` to all public pages (home, contact, gallery, blog index)
- Replace `getStaticPaths()` in blog `[...slug].astro` routes with `getCollection()` queries
- Verify build and preview functionality

### Out of Scope
- Login/register pages (Phase B)
- Admin panel protection (Phase B)
- API routes (Phase C)
- Contact form replacement with Supabase (Phase C)
- Calendar implementation
- Gallery backend functionality

## Capabilities

### New Capabilities
- `ssr-runtime`: SSR server configuration, middleware activation, and prerender strategy for public pages
- `blog-dynamic`: Blog routes working in server mode without getStaticPaths, using dynamic collection queries

### Modified Capabilities
- None (no existing capabilities are being modified at the spec level)

## Approach

Change `output` to `'server'` in astro.config.mjs, add `export const prerender = true` to all public pages, replace `getStaticPaths()` in blog routes with `getCollection()` + `import.meta.glob`, then verify build and preview functionality.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `astro.config.mjs` | Modified | Change output from 'static' to 'server' |
| `src/pages/blog/[...slug].astro` × 3 | Modified | Replace getStaticPaths with getCollection() |
| `src/pages/index.astro` + locale copies | Modified | Add export const prerender = true |
| `src/pages/contacto.astro` + locale copies | Modified | Add export const prerender = true |
| `src/pages/galeria/*.astro` + locale copies | Modified | Add export const prerender = true |
| `src/pages/blog/index.astro` + locale copies | Modified | Add export const prerender = true |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| getStaticPaths() removal needs careful testing | Medium | Verify each blog post renders in all locales |
| i18n + prerender interaction needs build verification | Low | Test build with all locale variations |
| Build-time vs runtime env vars for Supabase | Low | Verify env vars are accessible in SSR context |

## Rollback Plan

Revert `output: 'server'` to `output: 'static'` in astro.config.mjs and restore `getStaticPaths()` in blog routes.

## Dependencies

- Supabase package already installed
- @astrojs/node adapter already configured

## Success Criteria

- [ ] `npm run build` succeeds without errors
- [ ] All 14+ pages render correctly in dev mode
- [ ] Blog posts render in all 3 locales (es, en, uk)
- [ ] `npm run preview` shows functional site with SSR capabilities