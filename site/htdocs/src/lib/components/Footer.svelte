<script>
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { siteAuthor, githubLink } from '$lib/info.js';
  import { onMount } from 'svelte';

  let year;

  onMount(() => {
    year = new Date().getFullYear();
  });
</script>

<div class="site-footer">
  <footer class="site-info" itemtype="" itemscope>
    <div class="inside-site-info grid-container" id="footer">
      <nav>
        <h2>Useful links</h2>
        <ul>
          <li aria-current={$page.url.pathname === '/about' ? 'page' : undefined}>
            <a href="/about">About</a>
          </li>
          <li aria-current={$page.url.pathname === '/contact' ? 'page' : undefined}>
            <a href="/contact">Contact</a>
          </li>
          <li aria-current={$page.url.pathname === '/accessibility-statement' ? 'page' : undefined}>
            <a href="/accessibility-statement">Accessibility Statement</a>
          </li>
          <li aria-current={$page.url.pathname === '/support' ? 'page' : undefined}>
            <a href="/support">Support</a>
          </li>
          <li aria-current={$page.url.pathname === '/privacy-policy' ? 'page' : undefined}>
            <a href="/privacy-policy">Privacy policy</a>
          </li>
          <li aria-current={$page.url.pathname === githubLink ? 'page' : undefined}>
            <a href={githubLink}>GitHub</a>
          </li>
        </ul>
      </nav>
      <div class="copy-right-bar">
        © {year}, {siteAuthor} All rights reserved.
        <a class="back" href="#top">Back to top</a>
      </div>
    </div>
  </footer>
</div>
