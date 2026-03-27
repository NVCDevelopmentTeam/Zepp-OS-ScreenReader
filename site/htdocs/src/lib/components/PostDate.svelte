<script>
  /**
   * @typedef {Object} Props
   * @property {any} [post]
   * @property {string} [class]
   */

  /** @type {Props} */
  let {
    post,
    class: _class = ''
  } = $props();

  const formattedDate = $derived.by(() => {
    if (!post?.date) return '';
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(new Date(post.date));
    } catch {
      return post.date;
    }
  });
</script>

{#if post}
  <div class="flex items-center gap-3 text-gray-600 dark:text-gray-400 font-black uppercase tracking-widest text-[10px] {_class}">
    <time datetime={post.date}>
      {formattedDate}
    </time>
    <span class="w-1 h-1 rounded-full bg-blue-600" aria-hidden="true"></span>
    <span class="flex items-center gap-2">
      <div class="i-lucide-clock w-3.5 h-3.5 text-blue-500" aria-hidden="true"></div>
      {post.readingTime}
    </span>
  </div>
{/if}
