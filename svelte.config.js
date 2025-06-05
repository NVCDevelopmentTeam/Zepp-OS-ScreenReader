import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import adapter from '@sveltejs/adapter-auto'

try {
  export default {
    // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
    // for more information about preprocessors
    preprocess: vitePreprocess(),
    kit: {
      // Enable source maps for debugging
      sourceMap: true,
      // Add development mode configuration
      dev: {
        port: 3000,
        strict: true,
        errorOverlay: true,
        hmr: {
          enabled: true,
          overlay: true
        },
        typescript: {
          check: true,
          checkJs: true,
          tsconfig: './tsconfig.json'
        }
      },
      outDir: '.svelte-kit',
      target: '#svelte',
      adapter: adapter({
        pages: 'build',
        assets: 'build',
        fallback: 'index.html',
        precompress: false,
        strict: true
      }),
      alias: {
        $lib: './src/lib',
        $components: './src/components'
      },
      serviceWorker: {
        register: process.env.NODE_ENV === 'development'
      },
      files: {
        serviceWorker: 'src/service-worker',
        hooks: 'src/hooks'
      }
    },
    // Add compiler options for debugging
    compilerOptions: {
      dev: true,
      enableSourcemap: true,
      debugInfo: true,
      css: true,
      preserveComments: true,
      preserveWhitespace: true
    },
    // Add development tools
    vitePlugin: {
      hot: true,
      inspector: true,
      experimental: {
        inspector: {
          toggleKeyCombo: 'meta-shift',
          holdMode: true,
          showToggleButton: 'always'
        }
      }
    }
  }
} catch (error) {
  console.error('Svelte config error:', error);
  throw error;
}
