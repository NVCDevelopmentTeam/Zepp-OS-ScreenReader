<script>
  import '../app.css'
  import '../prism.css'
  import { siteTitle } from '$lib/info.js';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
  <title>{siteTitle}</title>
  <meta property="og:type" content="website" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <meta property="og:locale" content="en_US" />
</svelte:head>

<Header />

<main id="main">
  <slot />
</main>

<Footer />
