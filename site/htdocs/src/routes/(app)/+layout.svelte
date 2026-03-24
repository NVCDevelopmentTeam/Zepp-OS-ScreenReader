<script>
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';

  let { children } = $props();
</script>

<div class="min-h-screen flex flex-col bg-zepp font-sans selection:bg-blue-500/30">
  <Header />

  <main id="main" class="flex-grow pt-16 md:pt-20">
    {@render children?.()}
  </main>

  <Footer />
</div>
