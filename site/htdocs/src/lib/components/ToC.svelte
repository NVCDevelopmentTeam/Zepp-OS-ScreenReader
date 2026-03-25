<script>
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  
  let { post } = $props();
  let headings = $derived(post.headings || []);
  let activeHeadingId = $state(null);
  
  function handleScroll() {
    if (!browser) return;
    
    const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);
    const scrollPosition = window.scrollY + 100;

    for (let i = headingElements.length - 1; i >= 0; i--) {
      if (scrollPosition >= headingElements[i].offsetTop) {
        activeHeadingId = headings[i].id;
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

<nav class="space-y-1 relative" aria-label="Table of Contents" role="region">
  <div class="absolute left-0 top-0 w-px h-full bg-gray-100 dark:bg-white/5"></div>
  {#each headings as heading (heading.id)}
    {@const isActive = activeHeadingId === heading.id}
    <a 
      href={`#${heading.id}`}
      class="block py-2 pr-4 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 border-l-2 relative z-10 {isActive ? 'border-blue-600 text-blue-600 pl-4' : 'border-transparent text-gray-600 dark:text-gray-400 pl-4 hover:text-gray-900 dark:hover:text-white'}"
      style:margin-left={`${(heading.depth - 2) * 1}rem`}
    >
      {heading.value}
    </a>
  {/each}
</nav>
