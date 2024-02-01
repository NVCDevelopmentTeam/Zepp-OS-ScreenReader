<script>
  import Card from './Card.svelte'

  export let post
</script>

<Card href={`/news/${post.slug}`} data-sveltekit-prefetch>
  <slot slot="eyebrow" name="eyebrow" />
  <slot slot="title">{post.title}</slot>
  <div slot="description" class="prose">
    {@html post.preview.html}
  </div>
  <div slot="actions">
    <div class="flex items-center text-primary">
      <span class="text-2xl font-medium font-drip tracking-wider">Read -></span>
    </div>
  </div>
</Card>

<style>
  .prose > :global(p) {
    margin-top: 0;
    margin-bottom: 0;
  }
</style>
