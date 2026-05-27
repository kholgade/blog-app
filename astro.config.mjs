import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://blogs.be-astute.in',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
