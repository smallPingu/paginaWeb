# Clases de Dibujo Online — AGENTS.md

Static Astro 5 site for online drawing classes. Keep changes small and verify with the build.

## Commands

```sh
npm run dev
npm run build
npm run preview
```

No test, lint, or typecheck scripts exist.

## What matters here

- Astro i18n routes are `/`, `/en/`, `/uk/` (`prefixDefaultLocale: false`, `redirectToDefaultLocale: false`). Keep locale-aware links and wrappers aligned with that structure.
- `Astro.currentLocale` is the source of truth in templates; `src/i18n/utils.ts` falls back to Spanish when the locale is unknown.
- Content collections live in `src/content/config.ts`.
  - `blog` uses `import.meta.glob('../content/blog/*.md', { eager: true })` and `<post.Content />`; do **not** replace it with `Astro.glob`.
  - `obras` is configured but currently has no files; the gallery still renders hardcoded placeholders.
- GSAP lives in `src/scripts/animations.js`; if you add/remove page animations, keep `astro:before-swap` cleanup wired up to avoid stale animations.
- Gallery lightbox is plain JS in `src/scripts/gallery-lightbox.js`; init it with `initLightbox('#gallery-grid')`.
- Tailwind uses custom tokens: `brand-*`, `paper-*`, `ink-*`, `font-display`, `font-body`. Prefer those over default palette/font names.

## Known deployment constraints

- Contact form in `src/components/ContactoContent.astro` still depends on Netlify form handling.
- `public/admin/config.yml` still depends on Netlify/Decap CMS auth flow.
- `astro.config.mjs` still has a placeholder `site: 'https://tusitio.com'`; update it before a real deploy.
- `src/components/ContactoContent.astro`, `src/i18n/*.json`, and gallery placeholders still contain launch-time values that must be replaced.

## Repo-specific gotchas

- Blog locale copies must filter by `frontmatter.locale` in `getStaticPaths`.
- `@types/gsap` is only here because GSAP ships its own types.
- `src/content/obras/` is empty, so do not assume the gallery is content-driven yet.
