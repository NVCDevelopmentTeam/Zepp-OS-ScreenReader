<script>
  /**
   * @file Adsense.svelte
   * @description Handles Google AdSense loading with performance optimization.
   * Logic: Injects script.async dynamically after load, with a cache guard
   * to prevent duplicate injection on SPA navigation. No Partytown needed.
   */
  import { page } from '$app/state';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

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

  /** Delay helper — waits for full load then fires callback after `delay` ms */
  function afterLoad(callback, delay = 2000) {
    if (document.readyState === 'complete') {
      setTimeout(callback, delay);
    } else {
      window.addEventListener('load', () => setTimeout(callback, delay), { once: true });
    }
  }

  // On first mount: load the script
  onMount(() => {
    if (!browser) return;
    afterLoad(loadAdsenseScript, 2000);
  });

  // On every SPA navigation: push any new uninitiated ad slots
  $effect(() => {
    void page.url.pathname; // reactive — re-runs on route change
    if (!browser) return;
    afterLoad(pushUninitiatedAds, 2000);
  });
</script>
