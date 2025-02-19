<script>
  import '../app.css'
  import '../prism.css'
  import { siteTitle } from '$lib/info.js';
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>

<svelte:head>
  <title>{siteTitle}</title>
</svelte:head>
<main>
{@render children?.()}
</main>