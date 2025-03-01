<script>
  import '../app.css'
  import { siteTitle } from '$lib/info.js';
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>

<svelte:head>
  <title>{siteTitle}</title>
  <meta name="google-adsense-account" content="ca-pub-3602487920405886" />
  <link href="/sveltiaconfig.json" type="application/json" rel="cms-config-url" />
  <meta property="og:type" content="website" />
</svelte:head>
<main>
{@render children?.()}
</main>