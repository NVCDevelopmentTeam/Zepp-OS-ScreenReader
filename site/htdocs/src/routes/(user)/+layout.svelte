<script>
  import { siteTitle, siteDescription, siteURL, siteAuthor } from '$lib/info.js';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import ogImageURL from '$lib/images/logo.png';
  import { onMount } from 'svelte';

  const { children } = $props();

  // Analytics & Ads Configuration
  const CONFIG = {
    analytics: {
      id: 'G-NPS24E6QFN',
      debugMode: import.meta.env.DEV
    },
    adsense: {
      client: 'ca-pub-3602487920405886',
      enabled: import.meta.env.PROD
    }
  };

  // SEO Configuration
  const SEO = {
    meta: {
      keywords: 'zepp OS screen reader, ZSR, assistive technology for the blind',
      locale: 'en_US',
      type: 'website'
    },
    og: {
      imageAlt: 'ZSR logo'
    }
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

  // Initialize analytics with error handling
  const initAnalytics = () => {
    try {
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', CONFIG.analytics.id, {
        debug_mode: CONFIG.analytics.debugMode,
        page_path: window.location.pathname,
        send_page_view: true
      });
    } catch (error) {
      if (CONFIG.analytics.debugMode) {
        console.error('Analytics initialization failed:', error);
      }
    }
  };

  // Initialize AdSense
  const initAdsense = () => {
    if (!CONFIG.adsense.enabled) return;
    
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      if (CONFIG.analytics.debugMode) {
        console.error('AdSense initialization failed:', error);
      }
    }
  };

  onMount(() => {
    if (typeof window === 'undefined') return;

    // Initialize services after DOM is ready
    window.requestIdleCallback?.(() => {
      initAnalytics();
      initAdsense();
    }) || setTimeout(() => {
      initAnalytics();
      initAdsense();
    }, 1);

    // Track page changes
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          gtag?.('event', 'performance', {
            metric: 'FCP',
            value: entry.startTime
          });
        }
      });
    });
    observer.observe({ entryTypes: ['paint'] });
  });
</script>

<svelte:head>
  <!-- DNS Prefetch & Preconnect -->
  <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
  <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
  <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin />
  <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossorigin />

  <!-- Basic Meta -->
  <title>{siteTitle}</title>
  <meta name="description" content={siteDescription} />
  <meta name="keywords" content={SEO.meta.keywords} />
  <meta name="author" content={siteAuthor} />

  <!-- OpenGraph -->
  <meta property="og:type" content={SEO.meta.type} />
  <meta property="og:url" content={siteURL} />
  <meta property="og:site_name" content={siteTitle} />
  <meta property="og:title" content={siteTitle} />
  <meta property="og:description" content={siteDescription} />
  <meta property="og:locale" content={SEO.meta.locale} />
  <meta property="og:image" content={ogImageURL} />
  <meta property="og:image:alt" content={SEO.og.imageAlt} />

  <!-- Links -->
  <link rel="canonical" href={siteURL} />
  <link rel="alternate" type="application/rss+xml" title={siteTitle} href="{siteURL}/rss.xml" />

  <!-- Structured Data -->
  <script type="application/ld+json">
    {JSON.stringify(schemaData)}
  </script>

  <!-- Analytics Script - Load with high priority -->
  <script 
    async 
    src="https://www.googletagmanager.com/gtag/js?id={CONFIG.analytics.id}"
    importance="high"
  ></script>

  <!-- AdSense Script - Load with lower priority -->
  {#if CONFIG.adsense.enabled}
    <script 
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={CONFIG.adsense.client}"
      crossorigin="anonymous"
      importance="low"
    ></script>
  {/if}
</svelte:head>

<div class="flex flex-col min-h-screen">
  <Header />
  <main id="main" class="flex-grow bg-custom-background bg-cover bg-center">
    {@render children?.()}
  </main>
  <Footer />
</div>