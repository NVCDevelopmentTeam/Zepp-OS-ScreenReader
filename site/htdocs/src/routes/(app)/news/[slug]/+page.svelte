<script>
  import { siteTitle, siteAuthor } from '$lib/info.js';
  import ToC from '$lib/components/ToC.svelte';
  import PostDate from '$lib/components/PostDate.svelte';

  /**
   * @typedef {Object} Props
   * @property {import('./$types').PageData} data
   */

  /** @type {Props} */
  let { data } = $props();
</script>

<svelte:head>
  <title>{data.post.title} | {siteTitle}</title>
  <meta name="description" content={data.post.preview.text} />
  <meta name="author" content={siteAuthor} />
</svelte:head>

<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
  <div class="lg:flex lg:gap-24">
    
    <!-- Main Content -->
    <main class="flex-1 max-w-4xl mx-auto lg:mx-0 reveal-up">
      <article>
        <header class="mb-20">
          <a href="/news" class="group inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-12 hover:translate-x-[-4px] transition-transform" aria-label="Go back to news list">
            <div class="w-8 h-8 rounded-full bg-blue-500/10 flex-center" aria-hidden="true">
              <div class="i-lucide-arrow-left w-4 h-4"></div>
            </div>
            Back to News
          </a>
          
          <h1 class="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-12 leading-[1] text-gray-900 dark:text-white uppercase">
            {data.post.title}
          </h1>
          
          <div class="flex flex-wrap items-center gap-10 py-10 border-y border-gray-100 dark:border-white/5">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-blue-600 text-white flex-center shadow-lg shadow-blue-500/30">
                <div class="i-lucide-user w-6 h-6"></div>
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 mb-1">Author</p>
                <p class="text-sm font-black uppercase tracking-tight">{siteAuthor}</p>
              </div>
            </div>
            
            <div class="h-10 w-px bg-gray-100 dark:bg-white/5 hidden sm:block"></div>
            
            <PostDate post={data.post} class="text-xs uppercase font-bold tracking-widest text-gray-500" />
          </div>
        </header>

        <!-- Post Body -->
        <div class="prose prose-lg md:prose-xl dark:prose-invert max-w-none 
          prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase
          prose-a:text-blue-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-[2.5rem] prose-img:shadow-2xl prose-pre:rounded-[2rem] prose-pre:bg-zeppDark prose-pre:border prose-pre:border-white/5">
          <data.component />
        </div>

        <!-- Post Footer -->
        <footer class="mt-32 pt-16 border-t border-gray-100 dark:border-white/5">
          <div class="relative overflow-hidden rounded-[2.5rem] bg-blue-600 p-10 md:p-16 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent pointer-events-none"></div>
            <div class="relative z-10">
              <h3 class="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tighter">Stay Connected</h3>
              <p class="text-blue-100 text-lg font-medium opacity-80">Join our growing community and never miss an update.</p>
            </div>
            <a href="https://discord.gg/DAZU3E4mSP" target="_blank" class="btn bg-white text-blue-600 px-10 py-5 text-sm uppercase tracking-widest font-black shadow-xl hover:scale-105 active:scale-95 transition-all">
              Join Discord
            </a>
          </div>
        </footer>
      </article>
    </main>

    <!-- Sidebar / TOC -->
    <aside class="hidden lg:block w-72 shrink-0 reveal-up" style="animation-delay: 0.3s">
      <div class="sticky top-32">
        <div class="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full bg-gray-50 dark:bg-white/5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
          <div class="i-lucide-list w-4 h-4 text-blue-500"></div>
          Contents
        </div>
        <ToC post={data.post} />
      </div>
    </aside>
  </div>
</div>
