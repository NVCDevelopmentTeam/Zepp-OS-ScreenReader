<script>
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { siteAuthor, githubLink } from '$lib/info.js';
  import { onMount } from 'svelte';

  let year = $state();

  onMount(() => {
    year = new Date().getFullYear();
  });
</script>

<div class="site-footer bg-gray-800 text-white py-8">
  <footer class="site-info max-w-7xl mx-auto" itemscope>
    <div class="inside-site-info grid grid-cols-1 md:grid-cols-2 gap-8 px-4" id="footer">
      <nav>
        <h2 class="text-xl font-semibold mb-4">Useful links</h2>
        <ul class="space-y-2">
          <li aria-current={$page.url.pathname === '/about' ? 'page' : undefined}>
            <a href="/about" class="text-gray-300 hover:text-white">About</a>
          </li>
          <li aria-current={$page.url.pathname === '/contact' ? 'page' : undefined}>
            <a href="/contact" class="text-gray-300 hover:text-white">Contact</a>
          </li>
          <li aria-current={$page.url.pathname === '/accessibility-statement' ? 'page' : undefined}>
            <a href="/accessibility-statement" class="text-gray-300 hover:text-white">Accessibility Statement</a>
          </li>
          <li aria-current={$page.url.pathname === '/support' ? 'page' : undefined}>
            <a href="/support" class="text-gray-300 hover:text-white">Support</a>
          </li>
          <li aria-current={$page.url.pathname === '/privacy-policy' ? 'page' : undefined}>
            <a href="/privacy-policy" class="text-gray-300 hover:text-white">Privacy policy</a>
          </li>
          <li aria-current={$page.url.pathname === githubLink ? 'page' : undefined}>
            <a href={githubLink} class="text-gray-300 hover:text-white">GitHub</a>
          </li>
        </ul>
      </nav>
      <div class="copy-right-bar text-center md:text-left text-gray-400">
        © {year}, {siteAuthor} All rights reserved.
        <a class="back ml-4 text-gray-300 hover:text-white underline" href="#top">Back to top</a>
      </div>
    </div>
  </footer>
</div>
