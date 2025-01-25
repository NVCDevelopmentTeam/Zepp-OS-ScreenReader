<script>
  import { siteTitle } from '$lib/info.js';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>

<svelte:head>
  <title>{siteTitle}</title>
  <meta property="og:type" content="website" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <meta property="og:locale" content="en_US" />
</svelte:head>

<Header />
<div class="bg-custom-background bg-cover bg-center min-h-screen">
<main id="main">
  {@render children?.()}
</main>
</div>
<Footer />
