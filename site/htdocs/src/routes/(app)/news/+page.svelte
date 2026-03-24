<script>
  import { siteTitle } from '$lib/info.js';
  import PostsList from '$lib/components/PostsList.svelte';

  /**
   * @typedef {Object} Props
   * @property {import('./$types').PageData} data
   */

  /** @type {Props} */
  let { data } = $props();

  let isFirstPage = $derived(data.page === 1);
  let hasNextPage = $derived(data.posts[data.posts.length - 1]?.previous);
</script>

<svelte:head>
  <title>News & Updates | {siteTitle}</title>
  <meta name="description" content="Stay updated with the latest news and related events about Zepp OS screen reader." />
</svelte:head>

<div class="container py-20 reveal-up">
  <header class="max-w-4xl mb-24">
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
      Latest Updates
    </div>
    <h1 class="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase">
      News & <br /> <span class="text-blue-600">Releases</span>
    </h1>
    <p class="text-xl text-gray-500 font-medium max-w-2xl leading-relaxed">
      Stay informed with the latest developments, feature announcements, and community insights from the ZSR team.
    </p>
  </header>

  <div class="space-y-20">
    <PostsList posts={data.posts} />
  </div>

  <!-- Pagination -->
  {#if !isFirstPage || hasNextPage}
    <div class="flex items-center justify-between mt-32 pt-12 border-t border-gray-100 dark:border-white/5" aria-label="Pagination">
      {#if !isFirstPage}
        <a 
          href={`/news?page=${data.page - 1}`} 
          class="btn-secondary group flex items-center gap-3"
          data-sveltekit-prefetch
          aria-label={`Go to previous page (page ${data.page - 1})`}
        >
          <div class="i-lucide-arrow-left w-5 h-5 group-hover:-translate-x-2 transition-transform duration-300" aria-hidden="true"></div>
          <span class="text-xs uppercase tracking-widest font-black">Previous</span>
        </a>
      {:else}
        <div></div>
      {/if}

      <div class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] bg-gray-50 dark:bg-white/5 px-6 py-2 rounded-full" aria-current="page">
        Page {data.page}
      </div>

      {#if hasNextPage}
        <a 
          href={`/news?page=${data.page + 1}`} 
          class="btn-secondary group flex items-center gap-3"
          data-sveltekit-prefetch
          aria-label={`Go to next page (page ${data.page + 1})`}
        >
          <span class="text-xs uppercase tracking-widest font-black">Next</span>
          <div class="i-lucide-arrow-right w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" aria-hidden="true"></div>
        </a>
      {:else}
        <div></div>
      {/if}
    </div>
  {/if}
</div>
