<script>
  import { page } from '$app/state';
  import { onMount } from 'svelte';

  // Helper: push tất cả ad slots chưa được khởi tạo
  function pushUninitiatedAds() {
    if (typeof window === 'undefined') return;
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

  // Reactive: khi navigate sang trang mới, push ads nếu đã load rồi
  $effect(() => {
    // eslint-disable-next-line no-unused-vars
    const _path = page.url.pathname; // trigger reactive khi path đổi
    pushUninitiatedAds();
  });

  onMount(() => {
    let loaded = false;

    const loadAdsense = () => {
      if (loaded) return;
      loaded = true;

      const script = document.createElement('script');
      script.async = true;
      script.src =
        'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3602487920405886';
      script.crossOrigin = 'anonymous';

      // Sau khi script load xong → push toàn bộ ad slots hiện có trên trang
      script.onload = () => pushUninitiatedAds();

      document.head.appendChild(script);

      // Dọn listeners
      window.removeEventListener('scroll', loadAdsense);
      window.removeEventListener('mousemove', loadAdsense);
      window.removeEventListener('touchstart', loadAdsense);
    };

    // Timeout dài hơn Analytics (10s) để không tranh CPU lúc page vừa load
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadAdsense, { timeout: 10000 });
    } else {
      setTimeout(loadAdsense, 8000);
    }

    window.addEventListener('scroll', loadAdsense, { passive: true, once: true });
    window.addEventListener('mousemove', loadAdsense, { passive: true, once: true });
    window.addEventListener('touchstart', loadAdsense, { passive: true, once: true });
  });
</script>
