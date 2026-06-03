import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://tusitio.com',
  output: 'static',
  adapter: node({
    mode: 'standalone',
  }),
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
