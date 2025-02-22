<script>
  import PostPreview from '$lib/components/PostPreview.svelte'
  import PostDate from '$lib/components/PostDate.svelte'

  let { posts, children } = $props();
</script>

<div class="flex flex-col gap-16 md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
  {#each posts as post}
    <article class="grid items-start grid-cols-4 gap-8">
      <PostDate class="flex-col hidden md:flex text-sm" {post} />

      <div class="col-span-4 md:col-span-3">
        <PostPreview {post}>
          {#snippet eyebrow()}
                    {#if children}{@render children()}{:else}
              <PostDate class="md:hidden" {post} collapsed decorate />
            {/if}
                  {/snippet}
        </PostPreview>
      </div>
    </article>
  {/each}
</div>