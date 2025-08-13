<script>
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  let { children } = $props();
</script>

<svelte:head>
  <script>
    import { siteTitle, siteDescription, siteURL, siteAuthor } from '$lib/info.js';
    import ogImageURL from '$lib/images/logo.jpg';

    // SEO Configuration
    const SEO = {
      keywords: 'zepp OS screen reader, ZSR, assistive technology for the blind',
      locale: 'en_US',
      type: 'website',
      imageAlt: 'ZSR logo'
    };
  </script>
  <script type="application/ld+json">
    {JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteTitle,
    url: siteURL,
    description: siteDescription,
    author: {
      '@type': 'Person',
      name: siteAuthor
    }
  })}
  </script>
</svelte:head>

<div class="flex flex-col min-h-screen">
  <Header />
  <main id="main" class="flex-grow max-w-7xl mx-auto bg-custom-background bg-cover bg-center w-full">
    {@render children?.()}
  </main>
  <Footer />
</div>
