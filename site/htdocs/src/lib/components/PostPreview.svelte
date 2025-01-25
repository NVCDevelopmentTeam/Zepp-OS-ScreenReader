<script>
  import Card from './Card.svelte'
  import ArrowRightIcon from './ArrowRightIcon.svelte'

  let { post, eyebrow, children } = $props();

  const eyebrow_render = $derived(eyebrow);
</script>

<Card href={`/news/${post.slug}`} data-sveltekit-prefetch>
  {#snippet eyebrow()}
    {@render eyebrow_render?.()}
  {/snippet}
  {#snippet title()}
    {#if children}{@render children()}{:else}{post.title}{/if}
  {/snippet}
  {#snippet description()}
    <div  class="prose dark:prose-invert">
      {@html post.preview.html}
    </div>
  {/snippet}
  {#snippet actions()}
    <div >
      <div class="flex items-center text-teal-500">
        <span class="text-sm font-medium">Read</span>
        <ArrowRightIcon class="w-4 h-4 ml-1" />
      </div>
    </div>
  {/snippet}
</Card>

<style>
  .prose > :global(p) {
    margin-top: 0;
    margin-bottom: 0;
  }
</style>