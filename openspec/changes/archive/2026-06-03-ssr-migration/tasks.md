# Tasks: SSR Migration (Phase A)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~50 (15 additions, 30 deletions) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: Config + Foundation

- [x] 1.1 `astro.config.mjs`: Change `output: 'static'` → `output: 'server'`
- [x] 1.2 Create `.env.example` with `SUPABASE_URL=` and `SUPABASE_ANON_KEY=` placeholders

## Phase 2: Prerender Public Pages

Add `export const prerender = true;` to the frontmatter of:

- [x] 2.1 `src/pages/index.astro`
- [x] 2.2 `src/pages/en/index.astro`
- [x] 2.3 `src/pages/uk/index.astro`
- [x] 2.4 `src/pages/contacto.astro`
- [x] 2.5 `src/pages/en/contacto.astro`
- [x] 2.6 `src/pages/uk/contacto.astro`
- [x] 2.7 `src/pages/galeria/index.astro`
- [x] 2.8 `src/pages/en/galeria/index.astro`
- [x] 2.9 `src/pages/uk/galeria/index.astro`
- [x] 2.10 `src/pages/blog/index.astro`
- [x] 2.11 `src/pages/en/blog/index.astro`
- [x] 2.12 `src/pages/uk/blog/index.astro`

## Phase 3: Blog Dynamic Routes

Remove `getStaticPaths()` from each `[...slug].astro` — `BlogPostContent` already handles dynamic post lookup and 404 fallback:

- [x] 3.1 `src/pages/blog/[...slug].astro`: Remove entire `getStaticPaths()` function
- [x] 3.2 `src/pages/en/blog/[...slug].astro`: Same removal
- [x] 3.3 `src/pages/uk/blog/[...slug].astro`: Same removal

## Phase 4: Verify

- [x] 4.1 `npm run build` succeeds with zero errors
- [ ] 4.2 Dev server renders landing, blog index, galeria, contacto in all 3 locales (es, en, uk)
- [ ] 4.3 Blog slug routes return correct posts in each locale
- [ ] 4.4 Non-existent blog slug returns "Artículo no encontrado" fallback
