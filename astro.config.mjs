import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://tusitio.com',
  integrations: [
    tailwind(),
    mdx(),
    sitemap(),
  ],
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'uk'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
});
