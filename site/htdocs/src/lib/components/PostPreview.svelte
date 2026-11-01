<script>
  import Card from './Card.svelte'
  import PostDate from './PostDate.svelte'

  /** @type {{ post: any, heading?: 'h2' | 'h3', eyebrow?: import('svelte').Snippet, children?: import('svelte').Snippet }} */
  let { post, heading = 'h3', eyebrow, children } = $props();

  const eyebrow_snippet = $derived(eyebrow);
</script>

<Card href={`/news/${post.slug}/`} class="h-full" {heading}>
  {#snippet eyebrow()}
    <div class="flex items-center gap-3">
      <div class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest">Article</div>
      <PostDate {post} class="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest" />
      {#if eyebrow_snippet}
        {@render eyebrow_snippet()}
      {/if}
    </div>
  {/snippet}

  {#snippet title()}
    {#if children}{@render children()}{:else}{post.title}{/if}
  {/snippet}

  {#snippet description()}
    <div class="line-clamp-2 text-gray-600 dark:text-gray-400 font-medium">
      {post.preview.text}
    </div>
  {/snippet}

  {#snippet actions()}
    <div class="flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest group-hover:gap-4 transition-all duration-500">
      Read More
      <div class="i-lucide-arrow-right w-4 h-4"></div>
    </div>
  {/snippet}
</Card>
