// src/routes/admin/+page.js
// Note: Changed from [admin] to admin for proper routing

import sveltiaConfig from '../../../sveltia.config.js';

// SvelteKit page configuration
export const prerender = false;  // Disable prerendering
export const ssr = false;        // Disable server-side rendering
export const csr = true;         // Enable client-side rendering

/** @type {import('.