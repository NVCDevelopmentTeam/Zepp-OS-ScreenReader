<script>
  import { siteTitle, siteURL, siteAuthor } from '$lib/info.js';
  import ToC from '$lib/components/ToC.svelte';
  import { afterNavigate } from '$app/navigation';
  import PostDate from '$lib/components/PostDate.svelte';

  /** @type {import('./$types').PageData} */
  export let data;
</script>

<svelte:head>
  <title>{data.post.title} - {siteTitle}</title>
  <meta name="description" content={data.post.preview.text} />
  <meta name="author" content={siteAuthor} />
</svelte:head>

<div class="root max-w-2xl mx-auto lg:max-w-none">
  <div class="w-full mx-auto overflow-x-hidden">
    <article>
      <header class="flex flex-col">
        <h1 class="mt-6 text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
          {data.post.title}
        </h1>
        <PostDate class="text-sm sm:text-base" post={data.post} decorate collapsed />
      </header>

      <!-- render the post -->
      <div class="prose dark:prose-invert">
        <svelte:component this={data.component} />
      </div>
    </article>

    <!-- table of contents -->
    <div class="hidden xl:block pt-10">
      <aside class="sticky hidden w-48 ml-8 xl:block top-8" aria-label="Table of Contents">
        <ToC post={data.post} />
      </aside>
    </div>
  </div>
</div>

<style lang="postcss">
  .root {
    display: grid;
    grid-template-columns: 1fr;
  }

  @media (min-width: 42rem) {
    .root {
      /* 42rem matches max-w-2xl */
      grid-template-columns: 1fr 42rem 1fr;
    }
  }
</style>