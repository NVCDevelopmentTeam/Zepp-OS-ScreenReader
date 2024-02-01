<script>
  import PostPreview from '$lib/components/PostPreview.svelte'
  import PostDate from '$lib/components/PostDate.svelte'

  export let posts
</script>

<div class="flex flex-col gap-16">
  {#each posts as post}
    <article class="grid items-start grid-cols-4 gap-8">
      <PostDate class="flex-col hidden md:flex sm:text-lg" {post} />

      <div class="col-span-4 md:col-span-3">
        <PostPreview {post}>
          <slot slot="eyebrow">
            <PostDate class="md:hidden text-base" {post} collapsed decorate />
          </slot>
        </PostPreview>
      </div>
    </article>
  {/each}
</div>
