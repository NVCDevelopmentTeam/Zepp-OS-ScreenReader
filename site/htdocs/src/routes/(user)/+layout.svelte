<script>
  import { siteTitle, siteDescription, siteURL, siteAuthor } from '$lib/info.js';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import ogImageURL from '$lib/images/logo.png';
  import { partytownSnippet } from '@builder.io/partytown/integration';
  import { onMount } from 'svelte';

  // Props using Svelte 5 syntax
  const { children } = $props();

  // Constants
  const META_DEFAULTS = {
    keyword: 'zepp OS screen reader, ZSR, assistive technology for the blind',
    ogImageAlt: 'ZSR logo',
    locale: 'en_US'
  };

  // Structured data
  const jsonLD = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteTitle,
    url: siteURL
  };

  // Partytown configuration
  const PARTYTOWN_CONFIG = {
    forward: ['dataLayer.push', 'gtag']
  };

  // Initialize partytown HTML
  let partytownHTML = '';

  // Load partytown after component mounts
  onMount(() => {
    partytownHTML = partytownSnippet();
  });

  // Google Analytics ID
  const GA_ID = 'G-TG34FBKBKS';
  const ADSENSE_CLIENT = 'ca-pub-3602487920405886';
</script>

<svelte:head>
  <!-- Basic Meta Tags -->
  <title>{siteTitle}</title>
  <meta name="description" content={siteDescription} />
  <meta name="keywords" content={META_DEFAULTS.keyword} />
  <meta name="author" content={siteAuthor} />

  <!-- Canonical and RSS -->
  <link rel="canonical" href={siteURL} />
  <link rel="shortlink" href={siteURL} />
  <link 
    rel="alternate" 
    type="application/rss+xml" 
    title={siteTitle} 
    href="{siteURL}/rss.xml" 
  />

  <!-- Open Graph -->
  <meta property="og:url" content={siteURL} />
  <meta property="og:site_name" content={siteTitle} />
  <meta property="og:title" content={siteTitle} />
  <meta property="og:description" content={siteDescription} />
  <meta property="og:locale" content={META_DEFAULTS.locale} />
  <meta property="og:image" content={ogImageURL} />

  <!-- Facebook -->
  <meta name="facebook:card" content="summary_large_image" />
  <meta name="facebook:title" content={siteTitle} />
  <meta name="facebook:description" content={siteDescription} />
  <meta name="facebook:image" content={ogImageURL} />

  <!-- Structured Data -->
  <script type="application/ld+json">
    {JSON.stringify(jsonLD)}
  </script>

  <!-- Partytown Setup -->
  {@html partytownHTML}
  <script>
    partytown = {PARTYTOWN_CONFIG};
  </script>

  <!-- Analytics (Loaded via Partytown) -->
  <script 
    type="text/partytown" 
    async 
    src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"
  ></script>
  <script type="text/partytown">
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '{GA_ID}');
  </script>

  <!-- AdSense (Loaded via Partytown) -->
  <script 
    type="text/partytown" 
    async 
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={ADSENSE_CLIENT}"
    crossorigin="anonymous"
  ></script>
</svelte:head>

<Header />
<div class="bg-custom-background bg-cover bg-center min-h-screen">
  <main id="main">
    {@render children?.()}
  </main>
</div>
<Footer />