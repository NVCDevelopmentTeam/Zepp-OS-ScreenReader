<script>
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  
  $effect(() => {
    // page title/path for tracking
    const path = page.url.pathname;
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: document.title,
        page_location: location.href,
        page_path: path
      });
    }
  });

  onMount(() => {
    const trackPageView = () => {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
          page_title: document.title,
          page_location: location.href,
          page_path: page.url.pathname
        });
      }
    };

    const loadAnalytics = () => {
      // Create script 1
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = "https://www.googletagmanager.com/gtag/js?id=G-4YCKS1JTX8";
      script1.onload = trackPageView; // Track initial page view after load
      document.head.appendChild(script1);

      // Create script 2 (initialization)
      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-4YCKS1JTX8', { 'send_page_view': false });
      `;
      document.head.appendChild(script2);
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadAnalytics, { timeout: 5000 });
    } else {
      setTimeout(loadAnalytics, 3000);
    }
  });
</script>
