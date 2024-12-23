import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import decapCmsOauth from 'astro-decap-cms-oauth';

export default defineConfig({
    plugins: [
        sveltekit(),
        decapCmsOauth({
            // URL to the Sveltia CMS script
            decapCMSSrcUrl: 'https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js',
            // Enable or disable the admin dashboard
            adminDisabled: false,
            // Route for the admin dashboard
            adminRoute: '/admin',
            // Enable or disable OAuth functionality
            oauthDisabled: false,
            // Route for OAuth login
            oauthLoginRoute: '/oauth',
            // Route for OAuth callback
            oauthCallbackRoute: '/oauth/callback',
        }),
    ],
    server: {
        fs: {
            // Allow access to the project's root directory
            allow: ['.'],
        },
    },
});
