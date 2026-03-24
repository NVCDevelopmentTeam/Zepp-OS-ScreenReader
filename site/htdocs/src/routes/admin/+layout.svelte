<script>
  import logo from '$lib/images/logo.jpg?w=64&format=webp';
  import { siteTitle } from '$lib/info.js';
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>

<div class="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-950 text-gray-900 dark:text-gray-100">
  <!-- Admin Top Bar: Simple, functional, distinct from App header -->
  <header class="h-16 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-800 flex items-center px-6 sticky top-0 z-50">
    <a href="/admin" class="flex items-center gap-3">
      <img src={logo} alt="" class="w-8 h-8 rounded-lg" />
      <span class="font-bold tracking-tight text-sm uppercase">ZSR Manager</span>
    </a>
    
    <div class="ml-auto flex items-center gap-4">
      <a href="/" class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
        View Site
      </a>
      <div class="w-px h-4 bg-gray-200 dark:bg-dark-700"></div>
      <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Access</span>
    </div>
  </header>

  <div class="flex flex-1">
    <!-- Admin Sidebar: Only for Admin area -->
    <aside class="w-64 hidden lg:block bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-dark-800 p-6">
      <nav class="space-y-1" aria-label="Admin Navigation">
        <a href="/admin" class="flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-sm">
          <div class="i-lucide-layout-dashboard w-4 h-4"></div>
          Dashboard
        </a>
        <div class="pt-4 pb-2 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Content</div>
        <a href="/admin" class="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-800 text-gray-600 dark:text-gray-400 font-bold text-sm transition-colors">
          <div class="i-lucide-file-text w-4 h-4"></div>
          Blog Posts
        </a>
      </nav>
    </aside>

    <main class="flex-1 p-6 lg:p-10">
      {@render children?.()}
    </main>
  </div>

  <footer class="bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-800 py-4 px-6 text-center lg:text-left">
    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
      © {new Date().getFullYear()} {siteTitle} System • Confidential
    </p>
  </footer>
</div>
