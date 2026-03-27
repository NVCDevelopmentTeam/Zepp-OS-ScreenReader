<script>
  import { page } from '$app/state';

  // Track page view on SPA navigation
  $effect(() => {
    const path = page.url.pathname;
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: location.href,
        page_path: path
      });
    }
  });
</script>

<svelte:head>
  <!-- Global site tag (gtag.js) - Google Analytics via Partytown -->
  <script type="text/partytown" src="https://www.googletagmanager.com/gtag/js?id=G-4YCKS1JTX8"></script>
  <script type="text/partytown">
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', 'G-4YCKS1JTX8', { 'send_page_view': false });
  </script>
</svelte:head>
