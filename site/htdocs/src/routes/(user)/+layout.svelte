<script>
  import { siteTitle, siteDescription, siteURL, siteAuthor } from '$lib/info.js';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
import let keyword="zepp OS screen reader, ZSR, assistive technology for the blind";
import let ogImageURL="background.jpg";
import let ogImageAlt="background image";
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>

<svelte:head>
  <title>{siteTitle}</title>
  <meta name="description" content={siteDescription} />
  <meta name="keywords" content={keyword} />
  <meta name="author" content={siteAuthor} />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:title" content={siteTitle} />
  <meta property="og:description" content={siteDescription} />
  <meta property="og:image" content={ogImageURL} alt={ogImageAlt} />
  <meta property="og:url" content={siteURL} />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <meta name="theme-color" media="(prefers-color-scheme: light)" content="#FFFFFF" />
  <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" />
  <meta name="msapplication-TileColor" content="#201e1a" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={siteTitle} />
  <meta name="twitter:description" content={siteDescription} />
  <meta name="twitter:image" content={ogImageURL} />
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": siteTitle,
      "url": siteURL
    })}
  </script>
</svelte:head>

<Header />
<div class="bg-custom-background bg-cover bg-center min-h-screen">
<main id="main">
  {@render children?.()}
</main>
</div>
<Footer />
