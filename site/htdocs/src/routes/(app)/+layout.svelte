<script>
  import { siteTitle, siteDescription, siteURL, siteAuthor } from '$lib/info.js';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import ogImageURL from '$lib/images/logo.jpg';
  let { children } = $props();

  // SEO Configuration
  const SEO = {
    keywords: 'zepp OS screen reader, ZSR, assistive technology for the blind',
    locale: 'en_US',
    type: 'website',
    imageAlt: 'ZSR logo'
  };

  </script>

<svelte:head>
  <!-- Basic Meta -->
  <title>{siteTitle}</title>
  <meta name="description" content={siteDescription} />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <link rel="canonical" href={siteURL} />
  <meta name="keywords" content={SEO.keywords} />
  <meta name="author" content={siteAuthor} />
  <meta property="og:type" content={SEO.type} />
  <meta property="og:url" content={siteURL} />
  <meta property="og:site_name" content={siteTitle} />
  <meta property="og:title" content={siteTitle} />
  <meta property="og:description" content={siteDescription} />
  <meta property="og:locale" content={SEO.locale} />
  <meta property="og:image" content={ogImageURL} />
  <meta property="og:image:alt" content={SEO.imageAlt} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={siteTitle} />
  <meta name="twitter:description" content={siteDescription} />
  <meta name="twitter:image" content={ogImageURL} />
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