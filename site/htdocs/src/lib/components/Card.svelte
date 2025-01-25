<script>

  /**
   * @typedef {Object} Props
   * @property {string} [as]
   * @property {any} [href]
   * @property {any} [class]
   * @property {import('svelte').Snippet} [eyebrow]
   * @property {import('svelte').Snippet} [title]
   * @property {import('svelte').Snippet} [description]
   * @property {import('svelte').Snippet} [actions]
   */

  /** @type {Props} */
  let {
    as = 'div',
    href = undefined,
    class: _class = undefined,
    eyebrow,
    title,
    description,
    actions
  } = $props();
  
</script>

<svelte:element this={as} class={['relative flex flex-col items-start group', _class].join(' ')}>
  {@render eyebrow?.()}

  {#if title}
    <div class="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
      {#if href}
        <div
          class="absolute z-0 transition scale-95 opacity-0 -inset-y-6 -inset-x-4 bg-zinc-50 group-hover:scale-100 group-hover:opacity-100 dark:bg-zinc-800/50 sm:-inset-x-6 sm:rounded-2xl"
        ></div>
        
        <a {href} data-sveltekit-prefetch>
          <span class="absolute z-20 -inset-y-6 -inset-x-4 sm:-inset-x-6 sm:rounded-2xl"></span>
          <span class="relative z-10">
            {@render title?.()}
          </span>
        </a>
      {:else}
        {@render title?.()}
      {/if}
    </div>
  {/if}

  {#if description}
    <div
      class="relative z-10 flex-1 text-sm text-zinc-600 dark:text-zinc-400"
      class:mt-2={!!title}
    >
      {@render description?.()}
    </div>
  {/if}

  {#if actions}
    <div aria-hidden="true" class="relative z-10 flex items-center mt-4">
      {@render actions?.()}
    </div>
  {/if}
</svelte:element>
