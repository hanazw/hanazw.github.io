// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite"
import { satteri } from '@astrojs/markdown-satteri';
import { markdown_options } from './src/scripts/markdown_config.mjs';
import { languages, default_language } from './src/i18n/config.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://hanazw.github.io',
  trailingSlash: 'always',
  i18n: {
    locales: [...languages],
    defaultLocale: default_language,
    // The root page renders the default locale without a browser redirect.
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  markdown: {
    processor: satteri(markdown_options),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false },
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
