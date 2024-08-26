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
         <button  class="nav-link dropdown-toggle" id="navbarDropdown" role="link" aria-haspopup={haspopup} aria-expanded={expanded2} on:click={() => (expanded2 = !expanded2)}>
            {#if dropDownMenu}{dropDownMenu}{/if}
<label for="navbarDropdown">other services</label>
          </button>
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
