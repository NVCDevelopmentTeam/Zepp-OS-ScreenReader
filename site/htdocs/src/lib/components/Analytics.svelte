<script>
  import { run } from 'svelte/legacy';

  import { page } from '$app/state';
  run(() => {
    if (typeof gtag !== 'undefined') {
      gtag('config', 'G-4YCKS1JTX8', {
        page_title: document.title,
        page_path: page.url.pathname,
      });
    }
  });
</script>

<svelte:head>
  <script defer src="https://www.googletagmanager.com/gtag/js?id=G-4YCKS1JTX8"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());

    gtag('config', 'G-4YCKS1JTX8');
  </script>
</svelte:head>
