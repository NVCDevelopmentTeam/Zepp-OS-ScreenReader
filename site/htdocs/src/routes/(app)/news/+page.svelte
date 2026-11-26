<script>
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import NewsIndex from '#lib/components/NewsIndex.svelte'

  let { data } = $props()

  // Links from the old dynamic site (/news/?page=2) keep working: the site is static now, so the
  // page number moved into the path (/news/2/)
  onMount(() => {
    const page = Number(new URLSearchParams(location.search).get('page'))
    if (Number.isInteger(page) && page > 1) {
      goto(`/news/${page}/`, { replaceState: true })
    }
  })
</script>

<NewsIndex {data} />
