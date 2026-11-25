<script>
  import { browser } from '$app/env';
  import { onMount } from 'svelte';
  
  let { post } = $props();
  let headings = $derived(post.headings || []);
  let activeHeadingId = $state(/** @type {string | null} */ (null));
  
  function handleScroll() {
    if (!browser) return;

    const headingElements = headings
      .map((/** @type {{ id: string }} */ h) => ({
        id: h.id,
        el: document.getElementById(h.id)
      }))
      .filter((/** @type {{ id: string, el: HTMLElement | null }} */ item) => item.el !== null);

    const scrollPosition = window.scrollY + 100;

    for (let i = headingElements.length - 1; i >= 0; i--) {
      if (scrollPosition >= /** @type {HTMLElement} */ (headingElements[i].el).offsetTop) {
        activeHeadingId = headingElements[i].id;
        break;
      }
    }
  }
  
  onMount(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
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
    >
      {heading.text || heading.value}
    </a>
  {/each}
</nav>
