# Design: SSR Migration for Drawing Classes Site

## Technical Approach

Migrate from static (`output: 'static'`) to server (`output: 'server'`) output in Astro 5, enabling SSR for Supabase middleware and dynamic blog routes. Public pages (index, contacto, galeria, blog index) will be prerendered via `export const prerender = true` to maintain static HTML generation for performance. Blog detail routes (`[...slug].astro`) will replace `getStaticPaths()` with dynamic content lookup using `import.meta.glob` filtered by `Astro.currentLocale`, preserving the existing `<post.Content />` rendering pattern. Middleware remains unchanged as it already handles Supabase gracefully.

## Architecture Decisions

### Decision: Blog Post Lookup Mechanism

**Choice**: Use `import.meta.glob` with locale filtering at request time in `[...slug].astro`  
**Alternatives considered**: 
1. Astro content collections (`getCollection()`) - requires content config setup
2. Keep `getStaticPaths()` and generate all paths - incompatible with server mode
3. Dynamic import per slug - inefficient and complex error handling

**Rationale**: 
- Content collections would require adding config in `src/content/config.ts` and migrating markdown files, out of scope for Phase A.
- `import.meta.glob` mirrors current approach, leveraging existing eager imports while moving from build-time to request-time execution.
- Locale filtering via `Astro.currentLocale` ensures i18n correctness without path prefix complications.
- Preserves `<post.Content />` pattern and frontmatter access.

### Decision: Prerender Scope

**Choice**: Apply `export const prerender = true` to index, contacto, galeria, and blog index pages in all locales  
**Alternatives considered**:
1. Prerender all pages including blog posts - would cause excessive build time and stale content
2. No prerendering - loses performance benefits for static content
3. Prerender only default locale pages - breaks i18n experience

**Rationale**:
- Public pages change infrequently; prerendering provides CDN-friendly static HTML.
- Blog posts are content-driven and may change via Decap CMS; leaving them unprerendered ensures fresh content.
- Applying to all locales respects `prefixDefaultLocale: false` and avoids redirect loops.
- Astro 5 server mode honors `prerender = true` by generating static assets during build while keeping server runtime.

### Decision: 404 Handling for Blog Posts

**Choice**: Return 404 response when post not found or locale/draft mismatch, preserving existing fallback UI  
**Alternatives considered**:
1. Redirect to blog index - poor UX, hides missing content
2. Show empty post layout - misleading, requires template changes
3. Throw Astro error - non-standard status code

**Rationale**:
- Preserves current user experience where `BlogPostContent.astro` shows "Artículo no encontrado".
- Aligns with web standards (HTTP 404 for missing resources).
- Requires minimal changes: return `Astro.redirect()` or `Astro.status(404)` in component logic.

## Data Flow

Blog post request resolution in server mode:

```
Client GET /en/blog/technicas-de-carboncillo
        ↓
Middleware (src/middleware.ts) → executes, attaches Supabase client if available
        ↓
Astro server matches src/pages/en/blog/[...slug].astro
        ↓
Component: 
  1. Reads Astro.currentLocale ('en')
  2. import.meta.glob('../../../content/blog/*.md', { eager: true })
  3. Maps modules to { slug, frontmatter }
  4. Finds entry where slug === 'technicas-de-carboncillo' && frontmatter.locale === 'en' && !frontmatter.draft
        ↓
If found: 
  - Renders <Layout><BlogPostContent post={match} /></Layout>
  - BlogPostContent destructures post.frontmatter and renders <post.Content />
        ↓
If not found:
  - Returns Astro.status(400) + renders BlogPostContent with null post (shows fallback)
        ↓
Response: HTML (200 or 404) with appropriate headers
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `astro.config.mjs` | Modify | Change `output: 'static'` → `output: 'server'` |
| `src/pages/blog/[...slug].astro` | Modify | Replace `getStaticPaths()` with dynamic lookup + 404 handling |
| `src/pages/en/blog/[...slug].astro` | Modify | Same as above, adjust import path |
| `src/pages/uk/blog/[...slug].astro` | Modify | Same as above, adjust import path |
| `src/pages/index.astro` | Modify | Add `export const prerender = true` |
| `src/pages/en/index.astro` | Modify | Add `export const prerender = true` |
| `src/pages/uk/index.astro` | Modify | Add `export const prerender = true` |
| `src/pages/contacto.astro` | Modify | Add `export const prerender = true` |
| `src/pages/en/contacto.astro` | Modify | Add `export const prerender = true` |
| `src/pages/uk/contacto.astro` | Modify | Add `export const prerender = true` |
| `src/pages/galeria/index.astro` | Modify | Add `export const prerender = true` (and locale copies) |
| `src/pages/blog/index.astro` | Modify | Add `export const prerender = true` |
| `src/pages/en/blog/index.astro` | Modify | Add `export const prerender = true` |
| `src/pages/uk/blog/index.astro` | Modify | Add `export const prerender = true` |
| `src/components/BlogPostContent.astro` | Modify (optional) | Accept post prop; fallback to existing logic if none |

## Interfaces / Contracts

```astro
<!-- src/pages/*/blog/[...slug].astro -->
---
import Layout from '../../../layouts/Layout.astro';
import BlogPostContent from '../../../components/BlogPostContent.astro';

// Dynamic post lookup
const rawModules = import.meta.glob('../../../content/blog/*.md', { eager: true });
const posts = Object.entries(rawModules).map(([filepath, mod]) => ({
  slug: filepath.split('/').pop()?.replace(/\.md$/, ''),
  ...mod.frontmatter,
}));

const { slug } = Astro.params;
const post = posts.find(p => 
  p.slug === slug && 
  p.locale === Astro.currentLocale && 
  !p.draft
);

if (!post) {
  return Astro.status(404); // Renders component with null post
}
---
<Layout>
  <BlogPostContent post={post} />
</Layout>
```

```astro
<!-- src/components/BlogPostContent.astro (adjusted) ---
---
const post = Astro.props.post || {};
---
<!-- Existing fallback logic handles null/undefined post -->
<article>
  {post.frontmatter?.title && <h1>{post.frontmatter.title}</h1>}
  {!post.frontmatter && <p>Artículo no encontrado</p>}
  <Content /> {/* post.Content component from Astro */}
</article>
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Build | `npm run success` | Verify zero errors, correct static asset generation for prerendered pages |
| Dev SSR | `npm run dev` | Confirm blog posts render in all locales, middleware executes (Supabase logs) |
| Preview | `npm run preview` | Validate prerendered pages serve static HTML, dynamic routes SSR |
| Routes | Manual | Spot-check: `/`, `/en/`, `/uk/` render correct locale; `/blog/valid-slug` shows post; `/blog/invalid` shows 404 |
| i18n | Manual | Ensure no redirect loops, `Astro.currentLocale` matches URL prefix |
| Middleware | Manual | Verify Supabase client attaches (or null fallback) on every request |

## Migration / Rollout

- **Migration**: Change is backward-compatible in static mode; deploy via feature flag not needed.  
- **Rollout**: Deploy to staging, run build/dev/preview checks, then promote to production.  
- **Rollback**: Revert `output` to `'static'` and restore `getStaticPaths()` in blog files.

## Open Questions

- [ ] Should we add `export const prerender = true` to gallery index pages (currently `/galeria/`)?  
- [ ] Does Astro 5 require any additional configuration for `output: 'server'` with i18n prefixes?  
- [ ] Will the existing `import.meta.glob` eager loading cause performance issues with many blog posts?  
- [ ] Should we enforce 404 status via `Astro.status(404)` or rely on component fallback?  
- [ ] Need to verify that `@astrojs/node` adapter works correctly with `prerender = true` in server mode.
