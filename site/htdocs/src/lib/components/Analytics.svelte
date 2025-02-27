<script>
  import { page } from '$app/stores';
  import { browser } from '$app/environment';

  const trackingId = 'G-4YCKS1JTX8'; // Thay bằng mã đo lường của anh

  // Theo dõi thay đổi đường dẫn
  $: if (browser && typeof gtag !== 'undefined') {
    gtag('config', trackingId, {
      page_title: document.title,
      page_path: $page.url.pathname,
    });
  }
</script>

<svelte:head>
  <script async src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', '${trackingId}');
  </script>
</svelte:head>
