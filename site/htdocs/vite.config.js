import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import decapCmsOauth from 'astro-decap-cms-oauth';

export default defineConfig({
  plugins: [
    sveltekit(),
    decapCmsOauth({
      decapCMSSrcUrl: 'https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js',
      adminDisabled: false,
      adminRoute: '/admin',
      oauthDisabled: false,
      oauthLoginRoute: '/oauth',
      oauthCallbackRoute: '/callback',
    }),
  ],
  server: {
    fs: {
      allow: ['.'],
    },
  },
});
