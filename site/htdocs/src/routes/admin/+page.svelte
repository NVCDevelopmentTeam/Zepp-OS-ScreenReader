<script>
  import { siteTitle } from '$lib/info.js';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let { data } = $props();
  let config = $derived(data.config);

  let CMS = null;
  let cmsInitialized = $state(false);
  let cmsError = $state(null);

  async function initializeCMS() {
    try {
      const sveltia = await import('@sveltia/cms');
      CMS = sveltia.default;

      await CMS.init({
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
</svelte:head>

<div class="max-w-5xl mx-auto">
  {#if !config}
    <div class="card bg-red-500/10 border-red-500/20 p-16 text-center reveal-up">
      <div class="w-20 h-20 rounded-3xl bg-red-500 text-white flex-center mx-auto mb-8 shadow-xl shadow-red-500/20">
        <div class="i-lucide-alert-triangle w-10 h-10"></div>
      </div>
      <h2 class="text-3xl font-black uppercase tracking-tighter text-red-600 mb-4">Configuration Error</h2>
      <p class="text-red-500/80 font-medium max-w-md mx-auto leading-relaxed">Failed to load CMS configuration. Please check your sveltiaconfig.json route.</p>
    </div>
  {:else if cmsError}
    <div class="card bg-red-500/10 border-red-500/20 p-16 text-center reveal-up">
      <div class="w-20 h-20 rounded-3xl bg-red-500 text-white flex-center mx-auto mb-8 shadow-xl shadow-red-500/20">
        <div class="i-lucide-x-circle w-10 h-10"></div>
      </div>
      <h2 class="text-3xl font-black uppercase tracking-tighter text-red-600 mb-4">Initialization Failed</h2>
      <p class="text-red-500/80 font-medium max-w-md mx-auto leading-relaxed">{cmsError.message}</p>
    </div>
  {:else if !cmsInitialized}
    <div class="flex flex-col items-center justify-center py-32 space-y-10 reveal-up">
      <div class="relative">
        <div class="w-24 h-24 border-4 border-blue-600/20 rounded-full"></div>
        <div class="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <div class="text-center">
        <h2 class="text-2xl font-black uppercase tracking-[0.2em] mb-3">Syncing CMS</h2>
        <p class="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Preparing your environment...</p>
      </div>
    </div>
  {:else}
    <div id="sveltia-cms" class="animate-in fade-in zoom-in duration-700"></div>
  {/if}
</div>
