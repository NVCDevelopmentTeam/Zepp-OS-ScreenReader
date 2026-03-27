<script>
  import 'virtual:uno.css';
  import '../app.css';
  import { siteTitle, siteURL, siteDescription, siteAuthor } from '$lib/info.js';
  import ogImageURL from '$lib/images/logo.jpg';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  const { children } = $props();

  let isMobile = $state(false);

  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 768;
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  });

  // SEO Configuration
  const SEO = {
    keywords: 'zepp OS screen reader, ZSR, assistive technology for the blind, Amazfit accessibility',
    locale: 'en_US',
    type: 'website',
    imageAlt: 'ZSR logo'
  };
</script>

<svelte:head>
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
  <meta property="og:image" content={ogImageURL.startsWith('data:') ? ogImageURL : siteURL + ogImageURL} />
  <meta property="og:image:alt" content={SEO.imageAlt} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={siteTitle} />
  <meta name="twitter:description" content={siteDescription} />
  <meta name="twitter:image" content={ogImageURL.startsWith('data:') ? ogImageURL : siteURL + ogImageURL} />
  
  <meta name="google-adsense-account" content="ca-pub-3602487920405886" />
  <link href="/sveltiaconfig.json" type="application/json" rel="cms-config-url" />
  <link rel="sitemap" type="application/xml" href="{siteURL}/sitemap.xml" />
  <link rel="alternate" type="application/rss+xml" href="{siteURL}/rss.xml" />

  <script type="application/ld+json">
    {JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteTitle,
      url: siteURL,
      description: siteDescription,
      author: {
        '@type': 'Organization',
        name: siteAuthor
      }
    })}
  </script>
</svelte:head>

{@render children?.()}
