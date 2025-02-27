<script>
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  $: {
    if (browser && typeof client !== 'undefined') {
     client('config', 'ca-pub-3602487920405886' {

        page_title: document.title,
        page_path: $page.url.pathname,
      });
    }
  }
</script>
<svelte:head>
<script defer src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3602487920405886"
     crossorigin="anonymous"></script>
</svelte:head>