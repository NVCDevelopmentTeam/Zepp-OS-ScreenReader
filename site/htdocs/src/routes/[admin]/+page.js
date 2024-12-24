// src/routes/[admin]/+page.js

// Import the configuration from the project's root directory
import config from '@config';

export const prerender = false; // Disable prerendering for this page
export const ssr = false;       // Disable server-side rendering
export const csr = true;        // Enable client-side rendering

export async function load() {
  try {
    // Return the CMS configuration
    return {
      cms: true,
      config
    };
  } catch (error) {
    // Log any errors to the console
    console.error('CMS Config Error:', error);
    // Return an error message if the configuration fails to load
    return {
      cms: false,
      error: error.message
    };
  }
}
