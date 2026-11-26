<script>
  import { page } from '$app/state';
  import { siteTitle } from '#lib/info.js';

  const status = $derived(page.status);
  const notFound = $derived(status === 404);
  const heading = $derived(notFound ? 'Lost in Space' : 'Something went wrong');
  const description = $derived(
    notFound
      ? "The page you are looking for has been moved or doesn't exist."
      : 'An unexpected error occurred. Please try again in a moment, or get in touch if it keeps happening.'
  );
</script>

<svelte:head>
  <title>{notFound ? 'Page not found' : 'Error'} | {siteTitle}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main id="main" tabindex="-1" class="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
  <div class="relative mb-12">
    <!-- The big number is decoration; the page heading below is what gets announced -->
    <p class="text-[8rem] sm:text-[12rem] md:text-[18rem] font-black leading-none tracking-tighter opacity-5 select-none" aria-hidden="true">{status}</p>
    <div class="absolute inset-0 flex-center flex-col">
      <div class="w-24 h-24 rounded-3xl bg-blue-600 text-white flex-center shadow-2xl shadow-blue-500/40 mb-8 motion-safe:animate-bounce">
        <span class="i-lucide-alert-circle w-12 h-12" aria-hidden="true"></span>
      </div>
      <h1 class="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-4">
        <span class="sr-only">Error {status}: </span>{heading}
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-400 font-medium max-w-md mx-auto">{description}</p>
    </div>
  </div>

  <div class="flex flex-wrap justify-center gap-6 relative z-10">
    <a href="/" class="btn-primary group">
      Back to Home
      <span class="i-lucide-home w-5 h-5 ml-2" aria-hidden="true"></span>
    </a>
    <a href="/support/" class="btn-secondary">
      Get Support
    </a>
  </div>
</main>
