<script>
  import { siteTitle } from '#lib/info.js';
  import PostsList from '#lib/components/PostsList.svelte';

  /**
   * @typedef {Object} Props
   * @property {{ posts: any[], page: number, limit: number, total: number }} data
   */

  /** @type {Props} */
  let { data } = $props();

  let isFirstPage = $derived(data.page === 1);
  let hasNextPage = $derived(data.page * data.limit < data.total);

  // Page 1 is /news/, the others are /news/2/, /news/3/ ... (the site is static: no query string)
  /** @param {number} page */
  const pageHref = (page) => (page <= 1 ? '/news/' : `/news/${page}/`);
</script>

<svelte:head>
  <title>News & Updates{data.page > 1 ? ` (Page ${data.page})` : ''} | {siteTitle}</title>
  <meta name="description" content="Stay updated with the latest news and related events about Zepp OS screen reader." />
</svelte:head>

<div class="container py-20">
  <header class="max-w-4xl mb-24">
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-8">
      Latest Updates
    </div>
    <h1 class="text-4xl min-[420px]:text-5xl sm:text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase">
      News & <br /> <span class="text-blue-600 dark:text-blue-400">Releases</span>
    </h1>
    <p class="text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl leading-relaxed">
      Stay informed with the latest developments, feature announcements, and community insights from the ZSR team.
    </p>
  </header>

  <div class="space-y-20">
    <PostsList posts={data.posts} heading="h2" />
  </div>

  <!-- Pagination -->
  {#if !isFirstPage || hasNextPage}
    <nav class="flex items-center justify-between mt-32 pt-12 border-t border-gray-100 dark:border-white/5" aria-label="Pagination">
      {#if !isFirstPage}
        <a 
          href={pageHref(data.page - 1)} 
          class="btn-secondary group flex items-center gap-3"
          data-sveltekit-preload-data="hover"
          aria-label={`Go to previous page (page ${data.page - 1})`}
        >
          <span class="i-lucide-arrow-left w-5 h-5 group-hover:-translate-x-2 transition-transform duration-300" aria-hidden="true"></span>
          <span class="text-xs uppercase tracking-widest font-black">Previous</span>
        </a>
      {:else}
        <div></div>
      {/if}

      <div class="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-[0.3em] bg-gray-50 dark:bg-white/5 px-6 py-2 rounded-full" aria-current="page">
        Page {data.page}
      </div>

      {#if hasNextPage}
        <a 
          href={pageHref(data.page + 1)} 
          class="btn-secondary group flex items-center gap-3"
          data-sveltekit-preload-data="hover"
          aria-label={`Go to next page (page ${data.page + 1})`}
        >
          <span class="text-xs uppercase tracking-widest font-black">Next</span>
          <span class="i-lucide-arrow-right w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" aria-hidden="true"></span>
        </a>
      {:else}
        <div></div>
      {/if}
    </nav>
  {/if}
</div>
