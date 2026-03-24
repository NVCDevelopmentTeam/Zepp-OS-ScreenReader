<script>
  import PostPreview from './PostPreview.svelte'

  let { posts } = $props();
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
  {#each posts as post, i (post.slug)}
    <div class="reveal-up" style="animation-delay: {i * 0.1}s">
      <PostPreview {post} />
    </div>
  {/each}
</div>
