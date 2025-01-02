<script>
  import { siteTitle } from '$lib/info.js';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  export let data;
  const { config } = data;

  let CMS = null;
  let cmsInitialized = false;
  let cmsError = null;

  async function initializeCMS() {
    try {
      const sveltia = await import('@sveltia/cms');
      CMS = sveltia.default;

      await CMS.init({
        config: config,
        hooks: {
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

{#if !config}
  <div class="text-red-500 text-center mt-10">
    <h2 class="text-2xl font-bold">Configuration Error</h2>
    <p class="mt-2">Failed to load CMS configuration.</p>
  </div>
{:else if cmsError}
  <div class="text-red-500 text-center mt-10">
    <h2 class="text-2xl font-bold">CMS Initialization Failed</h2>
    <p class="mt-2">{cmsError.message}</p>
  </div>
{:else if !cmsInitialized}
  <div class="text-center text-lg mt-10">
    <p>Loading Content Management System...</p>
  </div>
{:else}
  <div id="sveltia-cms" class="mt-10"></div>
{/if}
