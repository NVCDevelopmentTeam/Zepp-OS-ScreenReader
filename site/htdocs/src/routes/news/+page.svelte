<script>
  import { siteTitle } from '$lib/info.js';
  import ArrowLeftIcon from '$lib/components/ArrowLeftIcon.svelte';
  import ArrowRightIcon from '$lib/components/ArrowRightIcon.svelte';
  import PostsList from '$lib/components/PostsList.svelte';

  /** @type {import('./$types').PageData} */
  export let data;

  let isFirstPage = data.page === 1;
  let hasNextPage = data.posts[data.posts.length - 1]?.previous;
</script>

<svelte:head>
  <title>News | {siteTitle}</title>
  <meta name="description" content="newsPage" />
</svelte:head>

<div class="flex flex-col flex-grow">
  <header class="pt-4">
    <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
      News
    </h1>
    <p class="mt-6">where to update the latest news and related events about Zepp os screen reader</p>
    <h2>Latest news</h2>
  </header>

  <div class="mt-8">
    <PostsList posts={data.posts} />
  </div>

  <!-- pagination -->
  <div class="flex items-center justify-between pt-16 pb-8">
    {#if !isFirstPage}
      <a href={`/news/${data.page - 1}`} data-sveltekit-prefetch class="flex items-center gap-2 font-medium text-zinc-700">
        <ArrowLeftIcon class="w-4 h-4" />
        Previous
      </a>
    {:else}
      <div />
    {/if}

    {#if hasNextPage}
      <a href={`/news/${data.page + 1}`} data-sveltekit-prefetch class="flex items-center gap-2 font-medium text-zinc-700">
        Next
        <ArrowRightIcon class="w-4 h-4" />
      </a>
    {/if}
  </div>
</div>

<style>
  a {
    @apply flex items-center gap-2 font-medium text-zinc-700;
  }

  :global(.dark) a {
    @apply text-zinc-300;
  }
</style>