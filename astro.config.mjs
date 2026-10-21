// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
  site: 'https://songeun22.github.io',

  integrations: [mdx()],

  // About now lives on the home page; keep old links working.
  redirects: {
    '/about': '/',
  },

  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      // Two themes so code blocks follow the site's dark/light toggle.
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
