<script>
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  // Props for flexibility
  /** @type {string} */
  export let adSlot = '';
  /** @type {string} */
  export let adFormat = 'auto';
  /** @type {boolean} */
  export let responsive = true;
  /** @type {string} */
  export let adStyle = 'display:block';

  // Initialize ads when component mounts
  onMount(() => {
    if (browser) {
      try {
        // Wait for adsense to load
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('Adsense error:', error);
      }
    }
  });
</script>

<svelte:head>
  <script defer src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3602487920405886"
     crossorigin="anonymous"></script>
</svelte:head>

{#if browser}
  <div class="ad-container">
    <ins class="adsbygoogle"
         style={adStyle}
         data-ad-client="ca-pub-3602487920405886"
         data-ad-slot={adSlot}
         data-ad-format={adFormat}
         data-full-width-responsive={responsive ? 'true' : 'false'}></ins>
  </div>
{/if}
