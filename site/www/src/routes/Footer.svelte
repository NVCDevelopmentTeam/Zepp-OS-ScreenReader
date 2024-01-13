<script>
  import { onMount } from 'svelte';

  let year;

  onMount(() => {
    year = new Date().getFullYear();
  });
</script>

<div class="site-footer">
  <footer class="site-info" aria-label="Site" itemtype="" itemscope>
    <div class="inside-site-info grid-container" id="footer">
      <nav aria-label="Footer">
        <ul>
          <li><a href="/accessibilityStatement">Accessibility Statement</a></li>
          <li><a href="/PrivacyPolicy">Privacy Policy</a></li>
          <li><a class="back" href="#top">Back to top</a></li>
        </ul>
      </nav>
      <div class="copy-right-bar">
        © {year} NVC Development Team. All rights reserved.
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