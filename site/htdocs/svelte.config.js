import adapter from '@sveltejs/adapter-vercel';
import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';
import preprocess from 'svelte-preprocess';
import sveltia from '@sveltia/cms';
import sveltiaConfig from './sveltia.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md', ...mdsvexConfig.extensions],
  preprocess: [
    preprocess({
      postcss: true
    }),
    mdsvex(mdsvexConfig),
    sveltia(sveltiaConfig)
  ],
  kit: {
    adapter: adapter(),
    prerender: {
      crawl: true,
      enabled: true,
      onError: 'continue',
      entries: ['*', '/sitemap.xml', '/rss.xml']
    },
      }
    }
  }
};

export default config;
