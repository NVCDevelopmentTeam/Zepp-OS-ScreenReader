<script>
  import { siteTitle, siteDescription, siteURL, siteAuthor } from '$lib/info.js';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import ogImageURL from '$lib/images/logo.png';
  import { partytownSnippet } from '@builder.io/partytown/integration';

  export let children;

  let keyword = "zepp OS screen reader, ZSR, assistive technology for the blind";
  let ogImageAlt = "ZSR logo";

  let jsonLD = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteTitle,
    "url": siteURL
  };
</script>

<svelte:head>
  <title>{siteTitle}</title>
  <link rel="shortlink" href={siteURL} />
  <link rel="alternate" type="application/rss+xml" title={siteTitle} href="{siteURL}/rss.xml" />
  <meta name="google-adsense-account" content="ca-pub-3602487920405886" />
  <link href="/sveltiaconfig.json" type="application/json" rel="cms-config-url" />
  <meta property="og:url" content={siteURL} />
  <meta property="og:site_name" content={siteTitle} />
  <meta property="og:title" content={siteTitle} />
  <meta property="og:description" content={siteDescription} />
  <link rel="profile" href="https://gmpg.org/xfn/11">
  <link rel="canonical" href={siteURL} />
  <meta name="description" content={siteDescription} />
  <meta name="keywords" content={keyword} />
  <meta name="author" content={siteAuthor} />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:image" content={ogImageURL} />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <meta name="theme-color" media="(prefers-color-scheme: light)" content="#FFFFFF" />
  <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" />
  <meta name="msapplication-TileColor" content="#201e1a" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={siteTitle} />
  <meta name="twitter:description" content={siteDescription} />
  <meta name="twitter:image" content={ogImageURL} />
  <script type="application/ld+json">{JSON.stringify(jsonLD)}</script>

  {@html partytownSnippet()}

  <script>
    partytown = {
      forward: ['dataLayer.push', 'gtag'],
    };
  </script>

  <script type="text/partytown" src="https://www.googletagmanager.com/gtag/js?id=G-ZK2KQKYDS6" async></script>
  <script type="text/partytown">
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-ZK2KQKYDS6');
  </script>

  <script type="text/partytown" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3602487920405886" crossorigin="anonymous" async></script>
</svelte:head>

<Header />
<div class="bg-custom-background bg-cover bg-center min-h-screen">
  <main id="main">
{@render children?.()}
  </main>
</div>
<Footer />
