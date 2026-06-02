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

Every page file exists per locale (thin Astro wrapper importing a shared content component from `src/components/`). Blog uses dynamic `[...slug].astro` — each locale copy has `getStaticPaths` filtering by `frontmatter.locale`.

### i18n

Translation files in `src/i18n/{es,en,uk}.json`. Dotted-path access via `useTranslations(locale)`:

```astro
const { t } = useTranslations(Astro.currentLocale || 'es');
```

`Astro.currentLocale` is how the active locale is obtained in templates. Locale prefix for links:

```astro
const localePrefix = locale === 'es' ? '' : `/${locale}`;
```

### Content collections (astro:content)

Defined in `src/content/config.ts` — two collections:

- **`blog`**: `.md` files in `src/content/blog/` with frontmatter (`locale`, `title`, `description`, `date`, `draft`, `author`, `image`). Loaded via `import.meta.glob` (NOT `Astro.glob` — deprecated in Astro 5). Slug extracted from filepath, `.url` not available on glob results.
- **`obras`**: Collection defined in config (`src/content/obras/`) with fields (`title`, `description`, `date`, `technique`, `image`, `category`). **No files exist yet** — the gallery currently renders hardcoded SVG placeholders, not from content.

Key: `import.meta.glob('../content/blog/*.md', { eager: true })` — NOT `Astro.glob`. Post body rendered via `<post.Content />`.

### GSAP Animations

All in `src/scripts/animations.js` (uses ScrollTrigger). Import in `<script>` tags:

```astro
<script>
  import { animateHero, animateReveal, cleanup } from '../scripts/animations.js';
  document.addEventListener('DOMContentLoaded', () => animateHero(container));
  document.addEventListener('astro:before-swap', cleanup);
</script>
```

Available: `animateHero`, `animateFloatingShapes`, `animateGalleryGrid`, `animateReveal`, `animateParallax`, `animateCounter`, `animateSectionDivider`, `cleanup`.

Gallery lightbox at `src/scripts/gallery-lightbox.js` — vanilla JS, zero deps. Init via `initLightbox('#gallery-grid')`.

### Tailwind Custom Palette

Use instead of stock:
- `brand-{50..950}` — orange/ochre
- `paper-{light,DEFAULT,dark}` — warm beige
- `ink-{light,DEFAULT,dark}` — dark text
- `font-display` — Playfair Display (headings)
- `font-body` — Inter (body)

Google Fonts loaded from CDN in `src/layouts/Layout.astro` (no local font files).

## Constraints

### Netlify Dependencies (current)

The site has two hard Netlify dependencies:
1. **Contact form** (`src/components/ContactoContent.astro`): uses `netlify` attribute + fetch POST to `/`. Only processes submissions when deployed on Netlify.
2. **Decap CMS** (`public/admin/config.yml`): uses `base_url: https://api.netlify.com` with Netlify Identity for auth.

These will need alternatives for the Raspberry Pi deploy plan in `docs/deploy-rpi.md`.

### Decap CMS

At `/admin/` after Netlify deploy. Client authenticates via GitHub, manages blog posts and gallery works. Collection config mirrors `src/content/config.ts`. Requires real GitHub repo in config.yml.

## Placeholders to Replace Before Launch

- `public/admin/config.yml` → `repo: usuario/repo-clases-dibujo`
- `astro.config.mjs` → `site: 'https://tusitio.com'`
- `src/components/ContactoContent.astro` → WhatsApp number (`wa.me/123456789`)
- `src/i18n/*.json` → email (`hola@clasesdibujo.com`)
- Gallery SVGs in `LandingContent.astro` / `GaleriaContent.astro` → real artwork images

## Known Quirks

- `import.meta.glob` with `{ eager: true }` is the supported glob API. `Astro.glob` is deprecated in Astro 5.
- `render` from `astro:content` unused — content rendered via `<post.Content />` from glob modules.
- Adding a blog post for English: create `.md` file with `locale: "en"` and `locale: "uk"` for Ukrainian. `getStaticPaths` in each locale's `[...slug].astro` filters by its locale.
- `src/content/obras/` collection is configured but has zero files. Gallery UI is hardcoded SVG placeholders — not yet wired to content collection.
- No `.gitignore` existed initially. Now created — ignores `node_modules/`, `dist/`, `.astro/`, `.env`, `*.local`, `.DS_Store`.
- `@types/gsap` is a no-op (GSAP v3 ships its own types), kept as devDependency only.
