<script>
  import '../app.css'
  import '../prism.css'
  import { siteTitle } from '$lib/info.js';
</script>

<svelte:head>
  <title>{siteTitle}</title>
    <meta name="google-adsense-account" content="ca-pub-3602487920405886" />
<link href="/sveltiaconfig.json" type="application/json" rel="cms-config-url" />
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3602487920405886"
     crossorigin="anonymous"></script>
</svelte:head>
<main>
<slot />
</main>