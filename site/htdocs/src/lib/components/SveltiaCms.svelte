<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { error } from '@sveltejs/kit';

  let CMS = null;
  let cmsInitialized = false;
  let cmsError = null;

  // Fetch configuration from server
  async function fetchCMSConfig() {
    try {
      const res = await fetch('/admin/config.yml');
      if (!res.ok) throw new Error('Failed to fetch CMS configuration');
      return await res.json();
    } catch (err) {
      console.error('Error fetching CMS config:', err);
      throw error(500, 'Error fetching CMS configuration');
    }
  }

  onMount(async () => {
    if (browser) {
      try {
        const cmsConfig = await fetchCMSConfig();
        const sveltia = await import('@sveltia/cms');
        CMS = sveltia.default;

        await CMS.init({
          config: cmsConfig,
          hooks: {
            preSave: (collection, data) => {
              if (collection === 'posts' && data.title.length < 3) {
                throw new Error('Post title must be at least 3 characters long.');
              }
              return data;
            },
            postSave: async (collection, data) => {
              console.log(`Saved ${collection}:`, data);
              try {
                await fetch('/api/deploy', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ collection, data }),
                });
              } catch (err) {
                console.error('Deployment trigger failed:', err);
              }
            },
          },
        });
        cmsInitialized = true;
      } catch (err) {
        cmsError = err;
        console.error('CMS Initialization Error:', err);
      }
    }
  });
</script>

{#if cmsError}
  <div class="cms-error">
    <h2>CMS Initialization Failed</h2>
    <p>{cmsError.message}</p>
  </div>
{:else if !cmsInitialized}
  <div class="cms-loading">
    <p>Initializing Content Management System...</p>
  </div>
{:else}
  <div id="sveltia-cms"></div>
{/if}

<style>
  .cms-error { color: #ff0000; }
  .cms-loading { font-size: 1.5rem; text-align: center; }
</style>
