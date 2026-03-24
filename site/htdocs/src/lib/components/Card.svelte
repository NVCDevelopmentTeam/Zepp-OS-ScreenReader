<script>
  /**
   * @typedef {Object} Props
   * @property {string} [as]
   * @property {string} [href]
   * @property {string} [class]
   * @property {string} [ariaLabel]
   * @property {import('svelte').Snippet} [eyebrow]
   * @property {import('svelte').Snippet} [title]
   * @property {import('svelte').Snippet} [description]
   * @property {import('svelte').Snippet} [actions]
   */

  /** @type {Props} */
  let {
    as = 'div',
    href = undefined,
    class: _class = '',
    ariaLabel = undefined,
    eyebrow,
    title,
    description,
    actions
  } = $props();
</script>

<svelte:element 
  this={as} 
  class="group relative flex flex-col items-start p-8 rounded-[2rem] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-2xl hover:translate-y-[-8px] transition-all duration-500 {_class}"
>
  {#if eyebrow}
    <div class="relative z-10 mb-5">
      {@render eyebrow()}
    </div>
  {/if}

  {#if title}
    <h3 class="relative z-10 text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">
      {#if href}
        <a {href} class="focus:outline-none" aria-label={ariaLabel}>
          <!-- This span makes the whole card clickable -->
          <span class="absolute -inset-0 z-20 rounded-[2rem]" aria-hidden="true"></span>
          <span class="relative z-10 group-hover:text-blue-600 transition-colors duration-300">
            {@render title()}
          </span>
        </a>
      {:else}
        {@render title()}
      {/if}
    </h3>
  {/if}

  {#if description}
    <div class="relative z-10 flex-1 text-gray-500 dark:text-gray-400 text-base leading-relaxed font-medium">
      {@render description()}
    </div>
  {/if}

  {#if actions}
    <div class="relative z-10 mt-8 pt-6 border-t border-gray-50 dark:border-white/5 w-full" aria-hidden="true">
      {@render actions()}
    </div>
  {/if}
</svelte:element>
