<script>
  import 'virtual:uno.css';
  import './layout.css';
  import { page } from '$app/state';
  import { siteTitle, siteURL, siteDescription, siteAuthor } from '#lib/info.js';
  import ogImageURL from '#lib/images/logo.jpg';
const { children } = $props();

  // Canonical and og:url must follow the current route, not always point at the home page
  const canonical = $derived(siteURL + page.url.pathname);
  const robots = $derived(
    page.url.pathname.startsWith('/admin')
      ? 'noindex, nofollow'
      : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
  );

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
  <meta name="robots" content={robots} />
  <link rel="canonical" href={canonical} />
  <meta name="keywords" content={SEO.keywords} />
  <meta name="author" content={siteAuthor} />
  <meta property="og:type" content={SEO.type} />
  <meta property="og:url" content={canonical} />
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
  <link rel="sitemap" type="application/xml" href="{siteURL}/sitemap.xml" />
  <link rel="alternate" type="application/rss+xml" href="{siteURL}/rss.xml" />

  <!-- A <script> element inside <svelte:head> is raw text, so the JSON-LD is emitted with {@html}.
       The content is a static object and `<` is escaped. -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteTitle,
      url: siteURL,
      description: siteDescription,
      author: {
        '@type': 'Organization',
        name: siteAuthor
      }
    }).replace(/</g, '\\u003c')}</` + 'script>'}
</svelte:head>

{@render children?.()}
