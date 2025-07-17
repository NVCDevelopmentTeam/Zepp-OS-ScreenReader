<script>
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import Card from './Card.svelte';
  
  let { post, children } = $props();
  let elements = [];
  let headings = $state(post.headings);
  
  // Alternative fix: Initialize as null and set in updateHeadings
  let activeHeading = $state(null);
  
  let scrollY;
  
  function updateHeadings() {
    headings = post.headings;
    activeHeading = headings[0]; // Set the initial active heading here
    if (browser) {
      elements = headings.map((heading) => {
        return document.getElementById(heading.id);
      });
    }
  }
  
  function setActiveHeading() {
    scrollY = window.scrollY;
    const visibleIndex =
      elements.findIndex((element) => element.offsetTop + element.clientHeight > scrollY) - 1;
    
    activeHeading = headings[visibleIndex];
    
    const pageHeight = document.body.scrollHeight;
    const scrollProgress = (scrollY + window.innerHeight) / pageHeight;
    
    if (!activeHeading) {
      if (scrollProgress > 0.5) {
        activeHeading = headings[headings.length - 1];
      } else {
        activeHeading = headings[0];
      }
    }
  }
  
  onMount(() => {
    updateHeadings();
    setActiveHeading();
  });
</script>

<svelte:window onscroll={setActiveHeading} />

<Card class="p-6 bg-white shadow-lg rounded-lg">
  {#if children}
    {@render children()}
  {:else}
    <ul class="flex flex-col gap-3">
      {#each headings as heading}
        <li
          class="pl-3 py-2 text-sm transition-colors border-l-4 border-teal-500 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-teal-50 dark:hover:bg-teal-700 rounded-md"
          class:active={activeHeading === heading}
          style={`--depth: ${Math.max(0, heading.depth - 1)}`}
        >
          <a href={`#${heading.id}`} class="flex items-center gap-2">
            <span class="truncate">{heading.value}</span>
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</Card>