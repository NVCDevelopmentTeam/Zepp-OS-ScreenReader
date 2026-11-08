<script>
  /**
   * @file Analytics.svelte
   * @description Handles Google Analytics tracking with performance optimization.
   * Logic: loads after the page has loaded and the visitor interacts (or after 25 s), so it never
   * blocks first paint, input or lab audits.
   */
  import { browser } from '$app/env';
  import { onMount } from 'svelte';
  import { afterInteraction } from '#lib/util.js';

  onMount(() => {
    if (!browser) return;

    // Initialize tracking after load + first interaction to prioritize user-critical content
    const initTracking = () => {
      // 1. Inject GTM Script
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-4YCKS1JTX8';
      script.async = true;
      document.head.appendChild(script);

      // 2. Setup Data Layer and Global Config
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', 'G-4YCKS1JTX8');
    };

    return afterInteraction(initTracking);
  });
</script>
