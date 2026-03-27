<script>
  import { page } from '$app/state';
  import { onMount } from 'svelte';

  // Track page view on SPA navigation — chỉ chạy sau khi gtag đã load
  $effect(() => {
    const path = page.url.pathname;
    // Chỉ track khi gtag đã sẵn sàng (tức là sau khi lazy load xong)
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: location.href,
        page_path: path
      });
    }
  });

  onMount(() => {
    let loaded = false;

    const loadAnalytics = () => {
      if (loaded) return;
      loaded = true;

      // Bước 1: Init dataLayer TRƯỚC — không cần script tag riêng
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', 'G-4YCKS1JTX8', { send_page_view: false });

      // Bước 2: Load GTM script SAU khi đã init xong
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-4YCKS1JTX8';
      script.onload = () => {
        // Track page view đầu tiên sau khi script load thành công
        window.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: location.href,
          page_path: page.url.pathname
        });
      };
      document.head.appendChild(script);

      // Dọn listeners
      window.removeEventListener('scroll', loadAnalytics);
      window.removeEventListener('mousemove', loadAnalytics);
      window.removeEventListener('touchstart', loadAnalytics);
    };

    // Chờ idle rồi mới load — ưu tiên page interactive trước
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadAnalytics, { timeout: 8000 });
    } else {
      setTimeout(loadAnalytics, 5000);
    }

    window.addEventListener('scroll', loadAnalytics, { passive: true, once: true });
    window.addEventListener('mousemove', loadAnalytics, { passive: true, once: true });
    window.addEventListener('touchstart', loadAnalytics, { passive: true, once: true });
  });
</script>
