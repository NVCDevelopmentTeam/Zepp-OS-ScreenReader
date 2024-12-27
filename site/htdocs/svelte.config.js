import adapter from '@sveltejs/adapter-vercel';
import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import sveltia from '@sveltia/cms';
import sveltiaConfig from './sveltia.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],

  preprocess: [
    vitePreprocess({ script: true }),
    mdsvex(mdsvexConfig),
    sveltia(sveltiaConfig)
  ],

  kit: {
    adapter: adapter(),
    prerender: {
      entries: ['*', '/sitemap.xml', '/rss.xml'],
      handleMissingId: 'warn'
    }
  }
};

export default config;
