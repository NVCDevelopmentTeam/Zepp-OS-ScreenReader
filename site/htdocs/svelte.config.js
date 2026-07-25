import { mdsvex } from 'mdsvex'
import mdsvexConfig from './mdsvex.config.js'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import adapter from '@sveltejs/adapter-cloudflare'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', ...mdsvexConfig.extensions],

  preprocess: [vitePreprocess(), mdsvex(mdsvexConfig)],

  kit: {
    adapter: adapter({
      // Cloudflare Pages: automatic routes.json
      routes: {
        include: ['/*'],
        exclude: ['<all>'] // Cloudflare serves static assets automatically
      }
    }),

    // Inline CSS smaller than 4KB directly into HTML → reduce 1 round-trip
    inlineStyleThreshold: 4096,

    // Prerender all static pages
    prerender: {
      entries: ['*'],
      handleHttpError: 'warn'
    },

    // Output gzip/brotli for faster Cloudflare serving
    // (handled by vite-plugin-compression2)

    alias: {
      $lib: 'src/lib'
    },

    // CSP set in hooks.server.js (dynamic nonce if needed later)
    csp: { mode: 'auto' }
  }
}

export default config
