<script>
  import { siteTitle, siteDescription, siteURL, siteAuthor } from '$lib/info.js';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import ogImageURL from '$lib/images/logo.jpg';
  let { children } = $props();
  import { onMount } from 'svelte';

  // SEO Configuration
  const SEO = {
    keywords: 'zepp OS screen reader, ZSR, assistive technology for the blind',
    locale: 'en_US',
    type: 'website',
    imageAlt: 'ZSR logo'
  };

  // Schema.org structured data
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteTitle,
    url: siteURL,
    description: siteDescription,
    author: {
      '@type': 'Person',
      name: siteAuthor
    }
  };

  onMount(() => {
    if (typeof window !== 'undefined') {
      // Track performance metrics if needed
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            // Performance tracking can be handled by your separate analytics component
          }
        });
      });
      observer.observe({ entryTypes: ['paint'] });
    }
  });
</script>

<svelte:head>
  <!-- Basic Meta -->
  <title>{siteTitle}</title>
  <meta name="description" content={siteDescription} />
  <meta name="keywords" content={SEO.keywords} />
  <meta name="author" content={siteAuthor} />
  <!-- OpenGraph -->
  <meta property="og:type" content={SEO.type} />
  <meta property="og:url" content={siteURL} />
  <meta property="og:site_name" content={siteTitle} />
  <meta property="og:title" content={siteTitle} />
  <meta property="og:description" content={siteDescription} />
  <meta property="og:locale" content={SEO.locale} />
  <meta property="og:image" content={ogImageURL} />
  <meta property="og:image:alt" content={SEO.imageAlt} />
  <!-- Links -->
  <link rel="alternate" type="application/rss+xml" title={siteTitle} href="{siteURL}/rss.xml" />
  <link rel="preconnect" href="https://www.googletagmanager.com">
  <link rel="preconnect" href="https://pagead2.googlesyndication.com">
  <!-- Structured Data -->
  <script type="application/ld+json">
    {JSON.stringify(schemaData)}
  </script>
</svelte:head>

<div class="flex flex-col min-h-screen">
  <Header />
  <main id="main" class="flex-grow bg-custom-background bg-cover bg-center">
{@render children?.()}
  </main>
  <Footer />
</div>