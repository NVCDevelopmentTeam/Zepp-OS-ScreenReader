import { mdsvex } from 'mdsvex'
import mdsvexConfig from './mdsvex.config.js'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import adapter from '@sveltejs/adapter-cloudflare'
import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import UnoCSS from 'unocss/vite'

// `wrangler` (a dependency of the Cloudflare adapter) loads `punycode` through whatwg-url@5, which makes
// Node 22+ print a DEP0040 warning on every dev/build run. The warning comes from that dependency,
// not from this project, so it is silenced for this process.
process.noDeprecation = true

// SvelteKit has no index.html, so the `transformIndexHtml` hooks of the UnoCSS plugins are never used;
// leaving them makes SvelteKit print a `transform_index_html_unsupported` warning.
const uno = UnoCSS().map((plugin) => {
  delete plugin.transformIndexHtml
  return plugin
})

export default defineConfig({
  plugins: [
    uno,
    // Cấu hình SvelteKit 3 mới nhất: Truyền trực tiếp các tùy chọn cấu hình vào sveltekit()
    sveltekit({
      extensions: ['.svelte', ...mdsvexConfig.extensions],
      preprocess: [vitePreprocess(), mdsvex(mdsvexConfig)],
      adapter: adapter({
        // Cloudflare Pages: automatic routes.json
        routes: {
          include: ['/*'],
          exclude: ['<all>'] /* Cloudflare serves static assets automatically */
        }
      }),

      // Inline the stylesheet into the HTML: first paint never waits for a separate CSS request
      inlineStyleThreshold: 100000,

      // Prerender all static pages
      prerender: { entries: ['*'], handleHttpError: 'warn' },
      // CSP set in hooks.server.js (dynamic nonce if needed later)
      csp: { mode: 'auto' }
    })
  ],

  // Cấu hình `drop` của esbuild ra cấp cao nhất
  esbuild: {
    drop: ['console', 'debugger']
  },

  build: {
    target: 'es2022',
    // Images under 8 kB (the hero background) are inlined; the Fira Mono font files stay separate
    assetsInlineLimit: 8192,
    // The Sveltia CMS chunk (~2 MB) is only loaded by /admin; every public chunk is far below 500 kB
    chunkSizeWarningLimit: 2500,
    // Informational build-time profiling notice, not a problem of the project
    rolldownOptions: { checks: { pluginTimings: false } }
  },

  optimizeDeps: {
    include: ['svelte', '@sveltejs/kit']
  },

  server: {
    fs: {
      allow: ['.']
    }
  }
})
