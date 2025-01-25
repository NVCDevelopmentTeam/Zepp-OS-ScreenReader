<script>
  import { siteTitle } from '$lib/info.js';
  import ArrowLeftIcon from '$lib/components/ArrowLeftIcon.svelte';
  import ArrowRightIcon from '$lib/components/ArrowRightIcon.svelte';
  import PostsList from '$lib/components/PostsList.svelte';

  /**
   * @typedef {Object} Props
   * @property {import('./$types').PageData} data
   */

  /** @type {Props} */
  let { data } = $props();

  let isFirstPage = data.page === 1;
  let hasNextPage = data.posts[data.posts.length - 1]?.previous;
</script>

<svelte:head>
  <title>News | {siteTitle}</title>
  <meta name="description" content="newsPage" />
</svelte:head>

<div class="flex flex-col min-h-screen bg-gray-50">
  <header class="pt-4 px-6 bg-white shadow-md">
    <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
      News
    </h1>
    <p class="mt-4 text-lg text-gray-700">
      Stay updated with the latest news and related events about Zepp OS screen reader
    </p>
    <h2 class="mt-6 text-xl font-semibold text-gray-800">Latest News</h2>
  </header>

  <div class="mt-8 px-6">
    <PostsList posts={data.posts} />
  </div>

  <!-- Pagination -->
  <div class="flex items-center justify-between pt-16 pb-8 px-6 bg-white shadow-md rounded-lg mt-8">
    {#if !isFirstPage}
      <a href={`/news/${data.page - 1}`} data-sveltekit-prefetch class="flex items-center gap-2 font-medium text-indigo-600 hover:text-indigo-800 transition">
        <ArrowLeftIcon class="w-4 h-4" />
        Previous
      </a>
    {:else}
      <div></div>
    {/if}

    {#if hasNextPage}
      <a href={`/news/${data.page + 1}`} data-sveltekit-prefetch class="flex items-center gap-2 font-medium text-indigo-600 hover:text-indigo-800 transition">
        Next
        <ArrowRightIcon class="w-4 h-4" />
      </a>
    {/if}
  </div>
</div>
