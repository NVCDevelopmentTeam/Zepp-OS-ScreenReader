<script>
  import '../app.css'
  import '../prism.css'
  import { siteTitle } from '$lib/info.js';
</script>

<svelte:head>
  <title>{siteTitle}</title>
    <meta name="google-adsense-account" content="ca-pub-3602487920405886" />
<link href="/news/sveltiaConfig.json" type="application/json" rel="cms-config-url" />
</svelte:head>
<main>
<slot />
</main>