import { mdsvex } from 'mdsvex'
import mdsvexConfig from './mdsvex.config.js'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import adapter from '@sveltejs/adapter-static'
import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import UnoCSS from 'unocss/vite'

// SvelteKit has no index.html, so the `transformIndexHtml` hooks of the UnoCSS plugins are never used;
// leaving them makes SvelteKit print a `transform_index_html_unsupported` warning.
const uno = UnoCSS().map((plugin) => {
  delete plugin.transformIndexHtml
  return plugin
})

export default defineConfig({
  plugins: [
    uno,
    // mdsvex 1.0 is a Vite plugin that automatically registers extensions (.svx, .md) with SvelteKit
    mdsvex(mdsvexConfig),
    // SvelteKit 3 configuration: pass configuration options directly into sveltekit()
    sveltekit({
      // Keep vitePreprocess() for CSS preprocessing if needed (Svelte 5 natively supports TS)
      preprocess: [vitePreprocess()],
      // Fully static site: every page is prerendered into `build/` (the Cloudflare Pages output directory)
      adapter: adapter({ pages: 'build', assets: 'build', fallback: undefined, strict: true }),

      // Inline the stylesheet into the HTML: first paint never waits for a separate CSS request
      inlineStyleThreshold: 100000,

      // Prerender all static pages
      // `/news/page/[page]` has no page to prerender until there are more posts than fit on one page,
      // which is expected, not an error
      prerender: { entries: ['*'], handleHttpError: 'warn', handleUnseenRoutes: 'ignore' },
      // CSP set in hooks.server.js (dynamic nonce if needed later)
      csp: { mode: 'auto' }
    })
  ],

  build: {
    target: 'es2022',
    // Images under 8 kB (the hero background) are inlined; the Fira Mono font files stay separate
    assetsInlineLimit: 8192,
    // The Sveltia CMS chunk (~2 MB) is only loaded by /admin; every public chunk is far below 500 kB
    chunkSizeWarningLimit: 2500,
    rolldownOptions: {
      // Informational build-time profiling notice, not a problem of the project
      checks: { pluginTimings: false },
      output: {
        // Vite 8 Rolldown minify configuration (replaces esbuild.drop)
        minify: {
          compress: {
            dropConsole: true,
            dropDebugger: true
          }
        }
      }
    }
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
