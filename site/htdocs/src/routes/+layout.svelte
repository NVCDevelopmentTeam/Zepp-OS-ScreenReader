<script>
  import { siteTitle } from '$lib/info.js';
  import Header from './Header.svelte';
  import Footer from './Footer.svelte';
		import './styles.css';
</script>

<svelte:head>
  <title>{siteTitle}</title>
  <meta property="og:type" content="website" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <meta property="og:locale" content="en_US" />
  <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/1.0.0/tailwind.min.css" rel="stylesheet" />
  <link href="https://cdnjs.cloudflare.com/ajax/libs/sveltekit-embed/0.0.12/sveltekit-embed.min.css" rel="stylesheet" />
</svelte:head>

<Header />

<main id="main">
  <slot />
</main>

<Footer />

<style>
  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100%;
    max-width: 64rem;
    margin: 0 auto;
    box-sizing: border-box;
  }
</style>