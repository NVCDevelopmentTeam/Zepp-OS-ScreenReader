<script>
  import { page } from '$app/state';
  import logo from '$lib/images/logo.jpg';
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
  <header class="bg-gray-800 text-white">
    <div class="max-w-7xl mx-auto px-4 flex items-center justify-between py-4">
      <a href="/admin" class="flex items-center">
        <img src={logo} alt="ZSR logo" class="h-10 w-auto" />
        <span class="ml-3 text-xl font-semibold">Dashboard</span>
      </a>
    </div>
  </header>

  <main class="flex-1 container mx-auto p-4 bg-gray-50">
    {@render children?.()}
  </main>

  <footer class="bg-gray-800 text-white py-6">
    <div class="max-w-7xl mx-auto px-4 flex justify-between">
      <a href="/" class="text-gray-300 hover:text-white">← Back to Zepp OS Screen Reader</a>
      <a href="/privacy-policy" class="text-gray-300 hover:text-white">Privacy Policy</a>
    </div>
  </footer>
</div>
