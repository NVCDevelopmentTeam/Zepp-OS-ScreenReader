<script>
  import { siteTitle } from '$lib/info.js';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  // Get the config data from the page load function
  export let data;
  const { config } = data;

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

      // Initialize the CMS with the loaded configuration
      await CMS.init({
        config: config, // Use the loaded config here
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

  // Initialize the CMS when the component is mounted and config is available
  onMount(() => {
    if (browser && config) {
      initializeCMS();
    }
  });
</script>

<svelte:head>
  <title>Dashboard | {siteTitle}</title>
  <meta name="description" content="Dashboard page" />
</svelte:head>

<!-- UI Rendering -->
{#if !config}
  <div class="text-red-500 text-center">
    <h2>Configuration Error</h2>
    <p>Failed to load CMS configuration</p>
  </div>
{:else if cmsError}
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