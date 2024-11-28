import { redirect } from '@sveltejs/kit';

// Disable prerendering and SSR for this route
export const prerender = false;
export const ssr = false;
export const csr = true;
export async function load({ url, fetch }) {
  try {
    // Use SvelteKit's built-in fetch instead of node-fetch
    const res = await fetch(`${url.origin}/admin/config.yml`);
    
    if (!res.ok) {
      // Throw an error if config file is not found
      throw new Error('CMS Configuration file not found');
    }

    // Return success status
    return {
      cms: true,
      config: await res.text() // Optional: return config contents if needed
    };
  } catch (error) {
    // Log the error for debugging
    console.error('CMS Configuration Load Error:', error);

    // Redirect to an error page
    throw redirect(307, '/error');
  }
}