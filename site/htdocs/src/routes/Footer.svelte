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
          <li aria-current={$page.url.pathname === '/accessibilityStatement' ? 'page' : undefined}>
            <a href="/accessibilityStatement">Accessibility Statement</a>
          </li>
          <li aria-current={$page.url.pathname === '/support' ? 'page' : undefined}>
            <a href="/support">Support</a>
          </li>
          <li aria-current={$page.url.pathname === '/PrivacyPolicy' ? 'page' : undefined}>
            <a href="/PrivacyPolicy">Privacy Policy</a>
          </li>
          <li aria-current={$page.url.pathname === githubLink ? 'page' : undefined}>
            <a href={githubLink}>github</a>
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

<style>
  .site-footer {
    margin-top: 32px;
    background-color: #f5f5f5;
    padding: 24px;
  }

  .site-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 12px;
    margin-top: 16px;
    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
  }

  .inside-site-info {
    max-width: 960px;
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    display: inline-block;
  }

  a {
    text-decoration: none;
    color: #333;
  }

  a:hover {
    color: #000;
  }

  .copy-right-bar {
    font-size: 14px;
    line-height: 1.5;
  }

  .back {
    font-weight: bold;
    font-size: 14px;
  }
</style>