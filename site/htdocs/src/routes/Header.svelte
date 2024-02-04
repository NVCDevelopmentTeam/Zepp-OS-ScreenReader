<script>
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import logo from '$lib/images/logo.png';
  import { githubLink, discordChat, zeppOSDev } from '$lib/info.js';

  let navMenu = '';
  let expanded = false;
  let dropDownMenu = '';
  let haspopup = true;
  let expanded2 = false;
  let darkMode = false;

  function toggle() {
    darkMode = !darkMode;
    window.document.body.classList.toggle('dark');
  }
</script>

<header id="top">
  <div class="site-logo">
    <div class="corner">
      <a href="/">
        <img src={logo} alt="ZSR logo" />
      </a>
    </div>
    <ul class="nav-item">
      <li>
        <a class="skip" href="#nav">Skip to main navigation</a>
      </li>
      <li>
        <a class="skip" href="#main">Skip to main content</a>
      </li>
      <li>
        <a class="skip" href="#footer">Skip to footer</a>
      </li>
    </ul>
  </div>
  <nav class="navbar navbar-expand-lg bg-dark navbar-dark py-3 fixed-top" id="nav">
    <button class="navbar-toggler" type="button" id="menu" on:click={() => (expanded = !expanded)} aria-expanded={expanded}>
      {#if navMenu}{navMenu}{/if}
      <label for="menu">Toggle navigation</label>
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarResponsive" hidden={!expanded}>
      <ul id="main-menu" class="navbar-nav ml-auto">
        <li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
          <a href="/">Home</a>
        </li>
        <li aria-current={$page.url.pathname === '/news' ? 'page' : undefined}>
          <a href="/news">News</a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="/" id="navbarDropdown" role="button" aria-label="other services" aria-haspopup={haspopup} aria-expanded={expanded2} on:click={() => (expanded2 = !expanded2)}>
            {#if dropDownMenu}{dropDownMenu}{/if}
          </a>
          <div class="dropdown-menu" aria-labelledby="navbarDropdown" hidden={!expanded2}>
            <ul class="dropdown-menu">
              <li aria-current={$page.url.pathname === githubLink ? 'page' : undefined}>
                <a class="dropdown-item" href={githubLink} title="github repo">Github</a>
              </li>
              <div class="dropdown-divider" />
              <li aria-current={$page.url.pathname === discordChat ? 'page' : undefined}>
                <a class="dropdown-item" href={discordChat} title="discord chat">Discord</a>
              </li>
              <div class="dropdown-divider" />
              <li aria-current={$page.url.pathname === '/support' ? 'page' : undefined}>
                <a class="dropdown-item" href="/support">Support</a>
              </li>
              <div class="dropdown-divider" />
              <li aria-current={$page.url.pathname === zeppOSDev ? 'page' : undefined}>
                <a class="dropdown-item" href={zeppOSDev}>Zepp OS Developer</a>
              </li>
            </ul>
          </div>
        </li>
        <li aria-current={$page.url.pathname === '/about' ? 'page' : undefined}>
          <a href="/about">About</a>
        </li>
        <li aria-current={$page.url.pathname === '/contact' ? 'page' : undefined}>
          <a href="/contact">Contact</a>
        </li>
      </ul>
    </div>
  </nav>
    <i>Theme</i>
    <button on:click={toggle} class="darkMode" id="darkMode" type="button" aria-pressed={darkMode} tabindex={darkMode || !darkMode ? '0' : '-1'}>
      <label for="darkMode">Dark mode</label>
      {#if darkMode}
        Go light
      {:else}
        Go dark
      {/if}
    </button>
</header>

<style>
  header {
    display: flex;
    justify-content: space-between;
  }

  .corner {
    width: 3em;
    height: 3em;
  }

  .corner a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .corner img {
    width: 2em;
    height: 2em;
    object-fit: contain;
  }

  nav {
    display: flex;
    justify-content: center;
    --background: rgba(255, 255, 255, 0.7);
  }

  ul {
    position: relative;
    padding: 0;
    margin: 0;
    height: 3em;
    display: flex;
    justify-content: center;
    align-items: center;
    list-style: none;
    background: var(--background);
    background-size: contain;
  }

  li {
    position: relative;
    height: 100%;
  }

  li[aria-current='page']::before {
    --size: 6px;
    content: '';
    width: 0;
    height: 0;
    position: absolute;
    top: 0;
    left: calc(50% - var(--size));
    border: var(--size) solid transparent;
    border-top: var(--size) solid var(--color-theme-1);
  }

  nav a {
    display: flex;
    height: 100%;
    align-items: center;
    padding: 0 0.5rem;
    color: var(--color-text);
    font-weight: 700;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-decoration: none;
    transition: color 0.2s linear;
  }

  a:hover {
    color: var(--color-theme-1);
  }

  button {
    background: var(--bg-color);
    border: 2px solid var(--text-color);
    border-radius: 5px;
    color: var(--text-color);
    padding: 10px 15px;
  }

  button:active {
    background: inherit;
  }
</style>