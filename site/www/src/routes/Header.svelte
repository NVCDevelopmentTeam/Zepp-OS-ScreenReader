<script>
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import logo from '$lib/images/logo.png';

  export let navMenu = 'Menu';
  let expanded = false;
  export let dropDownMenu = 'DropDownMenu';
  let haspopup = true;
    import collapse from 'svelte-collapse'
    let open = true;
  let expanded2 = false;
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
    <svg viewBox="0 0 23" aria-hidden="true">
      <path d="M0,0L1,2C1.5,31.5,32,3L2,0Z" />
    </svg>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded={expanded} aria-label="Toggle navigation" on:click={() => (expanded = !expanded)}>
      {navMenu}
      <svg viewBox="0 0 20 20" fill="none">
        <path class="vert" d="M10 1V19" stroke="black" stroke-width="2" />
        <path d="M1 10L19 10" stroke="black" stroke-width="2" />
      </svg>
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNavDropdown" hidden={!expanded} use:collapse={{open}}>
      <ul id="main-menu" class="navbar-nav ml-auto">
        <li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
          <a href="/">Home</a>
        </li>
        <li aria-current={$page.url.pathname === '/news' ? 'page' : undefined}>
          <a href="/news">News</a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" type="link" id="otherServices" href="/#" on:click={() => open = !open} aria-haspopup={haspopup}  aria-controls="DropDownMenu" aria-expanded={expanded2} data-toggle="dropdown" data-target="#navbarNavDropdown"   on:click={() => (expanded2   = !expanded2)}
            {dropDownMenu}>Other services 
      <span class="navbar-toggler-icon"></span>
          </a>
<div class="collapse navbar-collapse" id="DropDownMenu" hidden={!expanded2} use:collapse={{ open: true, duration: 0.2, easing: 'ease' }} Hidden={!open}>
          <ul class="dropdown-menu" aria-labelledby="other-services">
            <li aria-current={$page.url.pathname === '#github' ? 'page' : undefined}>
              <a class="dropdown-item" href="#github" title="github repo">Github</a>
            </li>
            <li aria-current={$page.url.pathname === '#discord' ? 'page' : undefined}>
              <a class="dropdown-item" href="#discord" title="discord chat">Discord</a>
            </li>
            <li class="dropdown-divider"></li>
            <li aria-current={$page.url.pathname === '/support' ? 'page' : undefined}>
              <a class="dropdown-item" href="/support">support</a>
            </li>
            <li aria-current={$page.url.pathname === '#ZeppOSDeveloper' ? 'page' : undefined}>
              <a class="dropdown-item" href="#zeppOsdeveloper">Zepp OS Developer</a>
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
      <svg viewBox="0 0 23" aria-hidden="true">
        <path d="M0,0L0,3C0.5,30.5,31,2L2,0Z" />
      </svg>
    </div>
  </nav>
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

  svg {
    width: 2em;
    height: 3em;
    display: block;
  }

  path {
    fill: var(--background);
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
</style>