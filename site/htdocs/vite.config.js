import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import decapCmsOauth from 'astro-decap-cms-oauth';

export default defineConfig({
    plugins: [
        sveltekit(),
        decapCmsOauth({
            decapCMSSrcUrl: 'https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js',
        }),
    ],
    server: {
        fs: {
            // Cho phép truy cập vào thư mục gốc của dự án
            allow: ['.'],
        },
    },
});
