import adapter from '@sveltejs/adapter-vercel';
import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';
import preprocess from 'svelte-preprocess';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],

  // Preprocess configuration
  preprocess: [
    vitePreprocess(),
    preprocess({
      postcss: true
    }),
    mdsvex({
      extensions: ['.md'],
      ...mdsvexConfig
    })
  ],

  kit: {
    // Adapter configuration
    adapter: adapter(),

    // Prerender configuration
    prerender: {
      entries: ['*', '/sitemap.xml', '/rss.xml'],
      handleMissingId: 'warn'
    }
  }
};

export default config;