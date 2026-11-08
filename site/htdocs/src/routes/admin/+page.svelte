<script>
  import { siteTitle } from '#lib/info.js';
  import { onMount } from 'svelte';
  import { browser } from '$app/env';
  import './sveltia-polyfills.js';

  /** @type {{ data: { config: any } }} */
  let { data } = $props();
  let config = $derived(data.config);

  /** @type {any} */
  let CMS = null;
  let cmsInitialized = $state(false);
  /** @type {Error | null} */
  let cmsError = $state(null);

  async function initializeCMS() {
    try {
      const sveltia = await import('@sveltia/cms');
      CMS = sveltia.default;

      await CMS.init({
        config: {
          ...config,
          backend: { ...config.backend, base_url: location.origin }
        }
      });
      cmsInitialized = true;
    } catch (err) {
      cmsError = /** @type {Error} */ (err);
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

<div class="w-full relative min-h-[calc(100vh-10rem)]">
  {#if !config}
    <div class="card bg-red-500/10 border-red-500/20 p-16 text-center max-w-5xl mx-auto">
      <div class="w-20 h-20 rounded-3xl bg-red-500 text-white flex-center mx-auto mb-8 shadow-xl shadow-red-500/20">
        <div class="i-lucide-alert-triangle w-10 h-10"></div>
      </div>
      <h2 class="text-3xl font-black uppercase tracking-tighter text-red-600 mb-4">Configuration Error</h2>
      <p class="text-red-500/80 font-medium max-w-md mx-auto leading-relaxed">Failed to load CMS configuration.</p>
    </div>
  {:else if cmsError}
    <div class="card bg-red-500/10 border-red-500/20 p-16 text-center max-w-5xl mx-auto">
      <div class="w-20 h-20 rounded-3xl bg-red-500 text-white flex-center mx-auto mb-8 shadow-xl shadow-red-500/20">
        <div class="i-lucide-x-circle w-10 h-10"></div>
      </div>
      <h2 class="text-3xl font-black uppercase tracking-tighter text-red-600 mb-4">Initialization Failed</h2>
      <p class="text-red-500/80 font-medium max-w-md mx-auto leading-relaxed">{cmsError.message}</p>
    </div>
  {:else}
    {#if !cmsInitialized}
      <div class="flex flex-col items-center justify-center py-32 space-y-10">
        <div class="relative">
          <div class="w-24 h-24 border-4 border-blue-600/20 rounded-full"></div>
          <div class="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <div class="text-center">
          <h2 class="text-2xl font-black uppercase tracking-[0.2em] mb-3">Syncing CMS</h2>
          <p class="text-gray-600 dark:text-gray-400 font-bold text-xs uppercase tracking-[0.3em]">Preparing your environment...</p>
        </div>
      </div>
    {/if}
    <div id="nc-root" class="w-full relative min-h-[calc(100vh-10rem)]" style={cmsInitialized ? '' : 'position: absolute; opacity: 0; pointer-events: none;'}></div>
  {/if}
</div>
