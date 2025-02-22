<script>
    // based on suggestions from:
    
    /**
     * @typedef {Object} Props
     * @property {any} headerText - Inclusive Components by Heydon Pickering https://inclusive-components.design/collapsible-sections/
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let { headerText, children } = $props();

    let expanded = $state(false);
</script>

<div class="border-b border-gray-200">
    <h2>
        <button 
            class="bg-white text-gray-900 flex justify-between w-full border-0 p-4" 
            aria-expanded={expanded} 
            onclick={() => expanded = !expanded}
        >
            {headerText}
            <svg viewBox="0 0 20 20" fill="none" class="h-3.5 w-3.5 transform transition-transform duration-200" 
                class:rotate-180={expanded} >
                <path class="vert" d="M10 1V19" stroke="currentColor" stroke-width="2"/>
                <path d="M1 10L19 10" stroke="currentColor" stroke-width="2"/>
            </svg>
        </button>
    </h2>

    <div class={expanded ? "block" : "hidden"}>
        {@render children?.()}
    </div>
</div>
