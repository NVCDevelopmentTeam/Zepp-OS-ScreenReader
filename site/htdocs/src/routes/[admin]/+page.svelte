<script>
  // Import necessary modules from SvelteKit
  import { siteTitle } from '$lib/info.js';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  // Initialize variables for CMS and its state
  let CMS = null;
  let cmsInitialized = false;
  let cmsError = null;

  // Function to initialize the CMS
  async function initializeCMS() {
    try {
      // Dynamically import the Sveltia CMS module
      const sveltia = await import('@sveltia/cms');
      CMS = sveltia.default;

      // Initialize the CMS with the configuration
      await CMS.init({
        config: {
          // Your CMS configuration goes here
        },
        hooks: {
          // Hook to validate data before saving
          preSave: (collection, data) => {
            if (collection === 'posts' && data.title.length < 3) {
              throw new Error('Post title must be at least 3 characters long.');
            }
            return data;
          },
        },
      });
      cmsInitialized = true;
    } catch (err) {
      cmsError = err;
      console.error('CMS Initialization Error:', err);
    }
  }

  // Initialize the CMS when the component is mounted
  onMount(() => {
    if (browser) {
      initializeCMS();
    }
  });
</script>

<svelte:head>
  <title>Dashboard | {siteTitle}</title>
  <meta name="description" content="Dashboard page" />
</svelte:head>

<!-- UI Rendering -->
{#if cmsError}
  <div class="text-red-500 text-center">
    <h2>CMS Initialization Failed</h2>
    <p>{cmsError.message}</p>
  </div>
{:else if !cmsInitialized}
  <div class="text-center text-lg">
    <p>Loading Content Management System...</p>
  </div>
{:else}
  <div id="sveltia-cms"></div>
{/if}
