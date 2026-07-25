<script>
  /**
   * @file Analytics.svelte
   * @description Handles Google Analytics tracking with performance optimization.
   * Logic: Loads after DOM is fully ready using setTimeout to avoid blocking initial paint.
   */
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  onMount(() => {
    if (!browser) return;

    // Initialize tracking after a delay to prioritize user-critical content
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

    // Ensure the DOM is fully loaded and interactive before triggering analytics
    if (document.readyState === 'complete') {
      setTimeout(initTracking, 2000);
    } else {
      window.addEventListener('load', () => setTimeout(initTracking, 2000), { once: true });
    }
  });
</script>
