<script>
  import Header from '#lib/components/Header.svelte';
  import Footer from '#lib/components/Footer.svelte';

  let { children } = $props();
</script>

<div class="min-h-screen flex flex-col bg-zepp font-sans selection:bg-blue-500/30">
  <Header />

  <main id="main" tabindex="-1" class="flex-grow pt-16 md:pt-28 focus:outline-none">
    {@render children?.()}
  </main>

  <Footer />
</div>
