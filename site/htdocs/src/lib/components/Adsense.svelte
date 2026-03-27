<script>
  import { page } from '$app/state';

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
    const _path = page.url.pathname; 
    pushUninitiatedAds();
  });
</script>

<svelte:head>
  <!-- Load AdSense via Partytown -->
  <script
    type="text/partytown"
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3602487920405886"
    crossorigin="anonymous"
  ></script>
</svelte:head>
