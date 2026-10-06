import { mdsvex } from 'mdsvex'
import mdsvexConfig from './mdsvex.config.js'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import adapter from '@sveltejs/adapter-cloudflare'
import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import UnoCSS from 'unocss/vite'
import { compression } from 'vite-plugin-compression2'

export default defineConfig({
  plugins: [
    UnoCSS(),
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

      // Inline CSS smaller than 4KB directly into HTML → reduce 1 round-trip
      inlineStyleThreshold: 4096,

      // Prerender all static pages
      prerender: { entries: ['*'], handleHttpError: 'warn' },
      // Output gzip/brotli for faster Cloudflare serving
      // (handled by vite-plugin-compression2)
      alias: { $lib: 'src/lib' },
      // CSP set in hooks.server.js (dynamic nonce if needed later)
      csp: { mode: 'auto' }
    }),

    // Tối ưu nén Brotli & Gzip
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
      deleteOriginalAssets: false,
      threshold: 1024
    }),
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
      deleteOriginalAssets: false,
      threshold: 1024
    })
  ],

  // Cấu hình `drop` của esbuild ra cấp cao nhất
  esbuild: {
    drop: ['console', 'debugger']
  },

  build: {
    target: 'es2022',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('@sveltia/cms')) return 'cms-engine'
          if (id.includes('node_modules/svelte')) return 'svelte-core'
        }
      }
    },
    chunkSizeWarningLimit: 500
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
