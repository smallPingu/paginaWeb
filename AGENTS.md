# Clases de Dibujo Online — AGENTS.md

Static landing site for online drawing classes. Astro 5 SSG, GSAP animations, 3-locale i18n.

## Commands

```sh
npm run dev      # local dev server (HMR)
npm run build    # static build → dist/
npm run preview  # serve built dist/ locally
```

No test, lint, or typecheck scripts configured.

## Architecture

### Routing (Astro i18n)

```
/           → Spanish         (prefixDefaultLocale: false)
/en/        → English
/uk/        → Ukrainian
```

Every page exists as a duplicate file per locale (thin wrapper importing a shared content component). Page files at:
- `src/pages/index.astro` + `src/pages/en/index.astro` + `src/pages/uk/index.astro`
- Same pattern for `galeria/`, `blog/`, `contacto.astro`

**Important**: Dynamic blog routes (`[...slug].astro`) exist at all three locale levels and each exports `getStaticPaths` filtering by `frontmatter.locale`.

### i18n

Translation files in `src/i18n/{es,en,uk}.json`. Use dotted-path access:
```astro
---
import { useTranslations } from '../i18n/utils';
const { t } = useTranslations(Astro.currentLocale || 'es');
---
<p>{t('hero.title')}</p>
```

Locale prefix for internal links:
```astro
const localePrefix = locale === 'es' ? '' : `/${locale}`;
```

### Content (blog)

Blog posts are `.md` files in `src/content/blog/` with frontmatter (`locale`, `title`, `description`, `date`, `draft`). Loaded via `import.meta.glob` — **not** `Astro.glob` (deprecated in Astro 5):

```astro
const rawModules = import.meta.glob('../content/blog/*.md', { eager: true });
const posts = Object.entries(rawModules).map(([fp, mod]) => ({
  slug: fp.split('/').pop()?.replace(/\.md$/, ''),
  ...mod.frontmatter,
})).filter(p => p.locale === locale && !p.draft);
```

`getStaticPaths` in `[...slug].astro` pages uses the same pattern, extracting slug from file path (no `.url` property on `import.meta.glob` results).

### GSAP Animations

Centralized in `src/scripts/animations.js`. Import in `<script>` tags in `.astro` components:

```astro
<script>
  import { animateHero, animateFloatingShapes, cleanup } from '../scripts/animations.js';
  document.addEventListener('DOMContentLoaded', () => { animateHero(container); });
  document.addEventListener('astro:before-swap', cleanup);
</script>
```

Available functions: `animateHero`, `animateFloatingShapes`, `animateGalleryGrid`, `animateReveal`, `animateParallax`, `animateCounter`, `animateSectionDivider`, `cleanup`.

Gallery lightbox at `src/scripts/gallery-lightbox.js` — vanilla JS, keyboard-accessible, zero deps. Initialized via `initLightbox('#gallery-grid')`.

### CMS

Decap CMS at `/admin/`. After Netlify deploy, client accesses `/admin/`, authenticates via GitHub, edits blog posts and gallery works. Config at `public/admin/config.yml`. **Requires**: real GitHub repo, Netlify identity setup.

## Design Tokens (Tailwind)

Custom palette — use instead of stock Tailwind colors:
- `brand-{50..950}` — orange/ochre brand
- `paper-{light,DEFAULT,dark}` — warm beige backgrounds
- `ink-{light,DEFAULT,dark}` — dark text tones
- `font-display` — Playfair Display (headings)
- `font-body` — Inter (body)

## Placeholders to Replace Before Launch

- `public/admin/config.yml`: `repo: usuario/repo-clases-dibujo` → real GitHub repo
- `astro.config.mjs`: `site: 'https://tusitio.com'` → real domain
- `src/components/ContactoContent.astro`: `wa.me/123456789` → real WhatsApp number
- `src/i18n/*.json`: email `hola@clasesdibujo.com` → real contact email
- Gallery: SVG placeholders in `LandingContent.astro` and `GaleriaContent.astro` → real artwork images

## Building

`npm run build` produces static HTML in `dist/`. Expected output: 14 pages (es/en/uk × landing, gallery, blog, blog-list, contact, plus 2 Spanish blog posts).

`dist/admin/` copies from `public/admin/` as-is (no build transform).

## Known Quirks

- `import.meta.glob` with `{ eager: true }` is the supported glob API. `Astro.glob` emits deprecation warnings and may be removed.
- `render` from `astro:content` is unused — post content rendered via `<post.Content />` from `import.meta.glob` modules.
- Blog posts filter by `locale` field in frontmatter. Adding a post for English requires a separate file with `locale: "en"`.
- No `.gitignore` exists. `dist/`, `node_modules/`, `.astro/` should be ignored before initial commit.
- `@types/gsap` is deprecated (GSAP ships its own types), kept only as no-op dependency.
