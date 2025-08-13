<script>
  import { siteTitle, siteAuthor } from '$lib/info.js';
  import ToC from '$lib/components/ToC.svelte';
  
  import PostDate from '$lib/components/PostDate.svelte';

  /**
   * @typedef {Object} Props
   * @property {import('./$types').PageData} data
   */

  /** @type {Props} */
  let { data } = $props();
</script>

<svelte:head>
  <title>{data.post.title} | {siteTitle}</title>
  <meta name="description" content={data.post.preview.text} />
  <meta name="author" content={siteAuthor} />
</svelte:head>

<div class="max-w-2xl mx-auto lg:max-w-none px-4 sm:px-6">
  <div class="w-full mx-auto overflow-x-hidden">
    <article class="prose lg:prose-xl dark:prose-invert">
      <header class="flex flex-col">
        <h1 class="mt-6 text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
          {data.post.title}
        </h1>
        <PostDate class="text-sm sm:text-base text-zinc-600 dark:text-zinc-400" post={data.post} decorate collapsed />
      </header>

      <!-- render the post -->
      <div class="mt-6">
        <data.component />
      </div>
    </article>

    <!-- table of contents -->
    <div class="hidden xl:block pt-10">
      <aside class="sticky top-8 xl:block w-48 ml-8" aria-label="Table of Contents">
        <ToC post={data.post} />
      </aside>
    </div>
  </div>
</div>
