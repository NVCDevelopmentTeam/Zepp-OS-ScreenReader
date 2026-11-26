<script>
  import NewsIndex from '#lib/components/NewsIndex.svelte'

  let { data } = $props()
</script>

<NewsIndex {data} />
