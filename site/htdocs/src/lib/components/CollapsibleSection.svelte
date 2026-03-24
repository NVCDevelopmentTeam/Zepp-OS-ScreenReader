<script>
    /**
     * @typedef {Object} Props
     * @property {string} headerText
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let { headerText, children } = $props();

    let expanded = $state(false);
    const id = Math.random().toString(36).substring(2, 9);
</script>

<div class="group border border-gray-100 dark:border-white/10 rounded-[2rem] overflow-hidden bg-white dark:bg-white/5 transition-all duration-500 shadow-sm hover:shadow-xl">
    <h3>
        <button 
            class="w-full flex items-center justify-between p-7 text-left transition-colors hover:bg-blue-500/5" 
            aria-expanded={expanded} 
            aria-controls={`content-${id}`}
            id={`button-${id}`}
            onclick={() => expanded = !expanded}
        >
            <span class="text-gray-900 dark:text-white font-black uppercase tracking-widest text-sm">{headerText}</span>
            <div 
                class="i-lucide-chevron-down w-5 h-5 text-blue-500 transition-transform duration-500" 
                class:rotate-180={expanded}
                aria-hidden="true"
            ></div>
        </button>
    </h3>

    {#if expanded}
        <div 
            id={`content-${id}`}
            class="px-7 pb-8 animate-in fade-in slide-in-from-top-4 duration-500"
            role="region"
            aria-labelledby={`button-${id}`}
        >
            <div class="pt-4 border-t border-gray-100 dark:border-white/5 mt-2">
                {@render children?.()}
            </div>
        </div>
    {/if}
</div>
