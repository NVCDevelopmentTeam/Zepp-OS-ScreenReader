<script>
  import { siteTitle } from '$lib/info.js';
</script>

<svelte:head>
  <title>Error | {siteTitle}</title>
</svelte:head>

<main class="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 reveal-up">
  <div class="relative mb-12">
    <h1 class="text-[12rem] md:text-[18rem] font-black leading-none tracking-tighter opacity-5 select-none">404</h1>
    <div class="absolute inset-0 flex-center flex-col">
      <div class="w-24 h-24 rounded-3xl bg-blue-600 text-white flex-center shadow-2xl shadow-blue-500/40 mb-8 animate-bounce">
        <div class="i-lucide-alert-circle w-12 h-12"></div>
      </div>
      <h2 class="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-4">Lost in Space</h2>
      <p class="text-xl text-gray-500 font-medium max-w-md mx-auto">The page you are looking for has been moved or doesn't exist.</p>
    </div>
  </div>

  <div class="flex flex-wrap justify-center gap-6 relative z-10">
    <a href="/" class="btn-primary group">
      Back to Home
      <div class="i-lucide-home w-5 h-5 ml-2"></div>
    </a>
    <a href="/support" class="btn-secondary">
      Get Support
    </a>
  </div>
</main>
