<script>
  import '../app.css';     // TailwindCSS base/styles
  import '../prism.css';   // Syntax highlighting styles

  import { siteTitle, siteURL } from '$lib/info.js'; // Site metadata

  // Grab the default snippet (children) from props
  // children is a Snippet injected by Svelte
  const { children } = $props();
</script>

<svelte:head>
  <!-- Page title -->
  <title>{siteTitle}</title>

  <!-- Google AdSense tag -->
  <meta name="google-adsense-account" content="ca-pub-3602487920405886" />

  <!-- CMS config link -->
  <link href="/sveltiaconfig.json" type="application/json" rel="cms-config-url" />

  <!-- Sitemap link for crawlers -->
  <link rel="sitemap" type="application/xml" href="{siteURL}/sitemap.xml" />

  <!-- RSS feed link -->
  <link rel="alternate" type="application/rss+xml" href="{siteURL}/rss.xml" />
</svelte:head>

<!-- Main application wrapper with Tailwind styling -->
<div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <main class="max-w-4xl mx-auto px-4 py-8">
    <!-- Render the page content -->
    {@render children?.()}
  </main>
</div>
