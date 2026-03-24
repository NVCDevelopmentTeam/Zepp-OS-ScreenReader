<script>
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  
  /* global adsbygoogle */

  $effect(() => {
    // eslint-disable-next-line no-unused-vars
    const path = page.url.pathname;
    
    // Push new adsense state if needed on path change
    if (typeof adsbygoogle !== 'undefined' && window.adsbygoogle.push) {
      // Find all adsense elements that haven't been initialized yet
      const ads = document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
      
      ads.forEach(() => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
          console.error('Adsense error during push:', err);
        }
      });
    }
  });

  onMount(() => {
    const loadAdsense = () => {
      const script = document.createElement('script');
      script.async = true;
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3602487920405886";
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadAdsense, { timeout: 8000 });
    } else {
      setTimeout(loadAdsense, 5000);
    }
  });
</script>
