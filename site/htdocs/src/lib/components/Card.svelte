<script>
  export let as = 'div'
  export let href = undefined

  let _class = undefined
  export { _class as class }
</script>

<svelte:element this={as} class={['relative flex flex-col items-start group', _class].join(' ')}>
  <slot name="eyebrow" />

  {#if $$slots.title}
    <div class="text-xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
      {#if href}
        <div
          class="absolute z-0 transition scale-95 opacity-0 -inset-y-6 -inset-x-4 bg-gray-900/5 group-hover:scale-100 group-hover:opacity-100 dark:bg-white/5 sm:-inset-x-6 sm:rounded-2xl"
        />
        <a {href}>
          <span class="absolute z-20 -inset-y-6 -inset-x-4 sm:-inset-x-6 sm:rounded-2xl" />
          <span class="relative z-10">
            <slot name="title" />
          </span>
        </a>
      {:else}
        <slot name="title" />
      {/if}
    </div>
  {/if}

  {#if $$slots.description}
    <div
      class="relative z-10 flex-1 text-sm text-zinc-600 dark:text-zinc-400"
      class:mt-2={!!$$slots.title}
    >
      <slot name="description" />
    </div>
  {/if}

  {#if $$slots.actions}
    <div aria-hidden="true" class="relative z-10 flex items-center mt-4">
      <slot name="actions" />
    </div>
  {/if}
</svelte:element>
