<script>
  import '../app.css'
  import '../prism.css'
  import { siteTitle } from '$lib/info.js';
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>

<svelte:head>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3602487920405886"
     crossorigin="anonymous"></script>
  <title>{siteTitle}</title>
    <meta name="google-adsense-account" content="ca-pub-3602487920405886" />
<link href="/sveltiaconfig.json" type="application/json" rel="cms-config-url" />
</svelte:head>
<main>
{@render children?.()}
</main>