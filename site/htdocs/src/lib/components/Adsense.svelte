<script>
  /**
   * @file Adsense.svelte
   * @description Handles Google AdSense loading with performance optimization.
   * Logic: injects script.async after load + first interaction (or 25 s), with a cache guard
   * to prevent duplicate injection on SPA navigation. No Partytown needed.
   */
  import { page } from '$app/state';
  import { browser } from '$app/env';
  import { onMount } from 'svelte';
  import { afterInteraction } from '#lib/util.js';

  const ADSENSE_CLIENT = 'ca-pub-3602487920405886';
  const ADSENSE_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  const ADSENSE_CACHE_KEY = '__adsense_loaded__';

  /** Inject AdSense script once, guard with a window-level cache flag */
  function loadAdsenseScript() {
    if (window[ADSENSE_CACHE_KEY]) return; // already injected, skip
    window[ADSENSE_CACHE_KEY] = true;

    const script = document.createElement('script');
    script.src = ADSENSE_SRC;
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }

  /** Push un-initialised ad slots (safe to call on every SPA navigation) */
  function pushUninitiatedAds() {
    if (typeof window.adsbygoogle === 'undefined') return;

    const ads = document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
    ads.forEach(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense push error:', err);
      }
    });
  }

  // On first mount: load the script
  onMount(() => {
    if (!browser) return;
    return afterInteraction(loadAdsenseScript);
  });

  // On every SPA navigation: push any new uninitiated ad slots
  $effect(() => {
    void page.url.pathname; // reactive — re-runs on route change
    if (!browser) return;
    return afterInteraction(pushUninitiatedAds);
  });
</script>
