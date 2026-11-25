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
      // Format in UTC so YYYY-MM-DD dates never shift a day across timezones
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
      }).format(new Date(post.date));
    } catch {
      return post.date;
    }
  });
</script>

{#if post}
  <div class="flex items-center gap-3 text-gray-600 dark:text-gray-400 font-black uppercase tracking-widest text-xs {_class}">
    <time datetime={post.date}>
      {formattedDate}
    </time>
    {#if post.readingTime}
      <span class="w-1 h-1 rounded-full bg-blue-600" aria-hidden="true"></span>
      <span class="flex items-center gap-2">
        <span class="i-lucide-clock w-3.5 h-3.5 text-blue-500 inline-block" aria-hidden="true"></span>
        {post.readingTime}
      </span>
    {/if}
  </div>
{/if}
