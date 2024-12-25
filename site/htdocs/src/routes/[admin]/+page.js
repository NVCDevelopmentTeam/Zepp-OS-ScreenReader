// src/routes/[admin]/+page.js

// Disable prerendering, enable client-side rendering
export const prerender = false;
export const ssr = false;
export const csr = true;

import { onMount } from 'svelte';
import { init } from '@sveltia/cms';

// Load configuration from sveltia.config.js
export const load = async ({ fetch }) => {
  try {
    const res = await fetch('/sveltia.config.js');
    const text = await res.text();
    const module = new Function('export default ' + text)(); 
    const config = module.default; 

    return {
      props: { config }
    };
  } catch (error) {
    console.error('Error loading configuration:', error);
    return {
      props: { config: null } 
    };
  }
};

// Initialize CMS on client-side only
onMount(() => {
  if (typeof window !== 'undefined' && config) {
    init({
      config
    });
  }
});