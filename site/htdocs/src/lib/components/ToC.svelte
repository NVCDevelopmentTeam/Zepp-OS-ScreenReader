<script>
  import { onMount } from 'svelte';

  let { post } = $props();
  let headings = $derived(post.headings || []);
  let activeHeadingId = $state(/** @type {string | null} */ (null));

  onMount(() => {
    let frame = 0;

    // Highlight the last heading that has scrolled past the top of the page. Runs at most once per
    // frame, and the heading positions are read only once the scrolling settles into that frame.
    function updateActiveHeading() {
      frame = 0;
      const scrollPosition = window.scrollY + 100;
      let current = null;

      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (el && scrollPosition >= el.offsetTop) current = heading.id;
      }

      activeHeadingId = current;
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(updateActiveHeading);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    updateActiveHeading();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  });
</script>

<nav class="space-y-1 relative" aria-label="Table of Contents">
  <div class="absolute left-0 top-0 w-px h-full bg-gray-100 dark:bg-white/5" aria-hidden="true"></div>
  {#each headings as heading (heading.id)}
    {@const isActive = activeHeadingId === heading.id}
    <a 
      href={`#${heading.id}`}
      class="block py-2 pr-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 border-l-2 relative z-10 {isActive ? 'border-blue-600 text-blue-600 dark:text-blue-400 pl-4' : 'border-transparent text-gray-600 dark:text-gray-400 pl-4 hover:text-gray-900 dark:hover:text-white'}"
      style:margin-left={`${(heading.depth - 2) * 1}rem`}
      aria-current={isActive ? 'location' : undefined}
    >
      {heading.text || heading.value}
    </a>
  {/each}
</nav>
