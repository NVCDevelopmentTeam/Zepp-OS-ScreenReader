<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';

  const trackingId = 'G-4YCKS1JTX8'; 

  function gtag() {
    window.dataLayer.push(arguments);
  }

  onMount(() => {
    if (browser) {
      window.dataLayer = window.dataLayer || [];
      gtag('js', new Date());
      gtag('config', trackingId, {
        page_path: $page.url.pathname,
        page_title: document.title,
      });
    }
  });

  $: if (browser && typeof gtag === 'function') {
    gtag('config', trackingId, {
      page_path: $page.url.pathname,
      page_title: document.title,
    });
  }
</script>

<svelte:head>
  <script async src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}></script>
</svelte:head>
