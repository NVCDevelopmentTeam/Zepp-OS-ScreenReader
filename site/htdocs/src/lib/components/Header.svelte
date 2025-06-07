<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import Adsense from './Adsense.svelte';
  import Analytics from './Analytics.svelte';
  import logo from '$lib/images/logo.jpg?w=100&format=webp';
  import { browser } from '$app/environment';
  import { githubLink, discordChat, zeppOSDev } from '$lib/info.js';

  let expanded = false; // mobile menu
  let expandedDropdown = false; // dropdown menu
  let darkMode = false; // theme mode
  let currentPath = $page.url.pathname;

  function toggleMobileMenu() {
    expanded = !expanded;
  }

  function toggleDropdown(event) {
    event.stopPropagation();
    expandedDropdown = !expandedDropdown;
  }

  function closeDropdown(event) {
    const target = event?.target;
    if (!target) return;
    if (
      expandedDropdown &&
      !target.closest('.dropdown') &&
      !target.closest('.dropdown-toggle')
    ) {
      expandedDropdown = false;
    }
  }

  function handleResize() {
    if (window.innerWidth >= 1024) {
      expanded = false;
    }
  }

  function applyDarkMode() {
    if (browser) {
      document.documentElement.classList.toggle('dark', darkMode);
    }
  }

  function toggleDarkMode(event) {
    if (!browser) return;

    if (event?.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;

    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode.toString());
    applyDarkMode();

    const liveRegion = document.getElementById('dark-mode-status');
    if (liveRegion) {
      liveRegion.textContent = darkMode
        ? 'toggle switching to dark mode'
        : 'toggle switching to light mode';
    }

    if (event?.key === ' ') {
      event.preventDefault();
    }
  }

  function initDarkMode() {
    if (!browser) return;
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      darkMode = saved === 'true';
    } else {
      darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      localStorage.setItem('darkMode', darkMode.toString());
    }
    applyDarkMode();
  }

  let previousPath = currentPath;
  $: {
    if ($page.url.pathname !== previousPath) {
      previousPath = $page.url.pathname;
      expanded = false;
      expandedDropdown = false;
    }
  }

  onMount(() => {
    if (!browser) return;

    initDarkMode();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => {
      if (!localStorage.getItem('darkMode')) {
        darkMode = event.matches;
        applyDarkMode();
      }
    };

    window.addEventListener('resize', handleResize);
    mediaQuery.addEventListener('change', handleChange);
    document.addEventListener('click', closeDropdown);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      document.removeEventListener('click', closeDropdown);
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

<!-- Live region for dark mode status, screen reader only -->
<div id="dark-mode-status" class="sr-only" aria-live="polite" aria-atomic="true"></div>

<header id="top" class="bg-white dark:bg-gray-900 shadow-md sticky top-0 w-full z-50">
  <div class="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">

    <!-- Logo -->
    <a href="/" class="flex items-center" aria-current={$page.url.pathname === '/' ? 'page' : undefined} aria-label="Home">
      Zepp OS screen reader
      <img src={logo} alt="ZSR logo" class="h-10 w-auto" loading="lazy" />
    </a>

    <!-- Skip links -->
    <ul class="sr-only">
      <li><a href="#nav">Skip to main navigation</a></li>
      <li><a href="#main">Skip to main content</a></li>
      <li><a href="#footer">Skip to footer</a></li>
    </ul>

    <!-- Mobile menu toggle -->
    <button
      class="lg:hidden text-gray-800 dark:text-gray-200"
      aria-label="Toggle navigation"
      aria-expanded={expanded}
      aria-controls="nav"
      on:click={toggleMobileMenu}
      on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleMobileMenu()}
    >
      <span class="sr-only">Toggle navigation</span>
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <!-- Navigation menu with items sorted A-Z -->
    <nav
      id="nav"
      class={`${expanded ? 'block' : 'hidden'} lg:block`}
            aria-label="Primary"
    >
      <ul class="flex flex-col lg:flex-row lg:space-x-6 text-gray-800 dark:text-gray-200 px-4 py-3 lg:p-0">
        <li>
          <a
            href="/about"
            class="hover:underline py-2 lg:py-0 block"
            aria-current={$page.url.pathname === '/about' ? 'page' : undefined}
          >About</a>
        </li>
        <li>
          <a
            href="/contact"
            class="hover:underline py-2 lg:py-0 block"
            aria-current={$page.url.pathname === '/contact' ? 'page' : undefined}
          >Contact</a>
        </li>
        <li>
          <a
            href="/"
            class="hover:underline py-2 lg:py-0 block"
            aria-current={$page.url.pathname === '/' ? 'page' : undefined}
          >Home</a>
        </li>
        <li>
          <a
            href="/news"
            class="hover:underline py-2 lg:py-0 block"
            aria-current={$page.url.pathname === '/news' ? 'page' : undefined}
          >News</a>
        </li>

        <!-- Dropdown -->
        <li class="relative">
          <button
            type="button"
              role="link"
            class="dropdown-toggle hover:underline py-2 lg:py-0 w-full text-left lg:w-auto block"
            aria-haspopup="true"
            aria-expanded={expandedDropdown}
            aria-controls="dropdown-menu"
            on:click={toggleDropdown}
            on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleDropdown(e)}
          >
            Other Services
          </button>

          {#if expandedDropdown}
            <ul
              id="dropdown-menu"
              class="absolute bg-white dark:bg-gray-800 shadow-md mt-2 rounded-md space-y-2 lg:space-y-0 w-full lg:w-48 z-20 dropdown"
              role="menu"
              aria-label="Other services"
            >
              <li role="none">
                <a
                  href={discordChat}
                  class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                  tabindex="0"
                  >Discord</a
                >
              </li>
              <li role="none">
                <a
                  href={githubLink}
                  class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                  tabindex="0"
                  >Github</a
                >
              </li>
              <li role="none">
                <a
                  href="/support"
                  class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-current={$page.url.pathname === '/support' ? 'page' : undefined}
                  role="menuitem"
                  tabindex="0"
                  >Support</a
                >
              </li>
              <li role="none">
                <a
                  href={zeppOSDev}
                  class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                  tabindex="0"
                  >Zepp OS Development</a
                >
              </li>
            </ul>
          {/if}
        </li>
      </ul>
    </nav>

    <!-- Change to theme mode text, italic by Tailwind -->
    <span class="italic">Change to theme mode</span>

    <!-- Dark mode toggle -->
    <button
      id="dark-mode-toggle"
      class="ml-4 p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
      aria-pressed={darkMode}
      aria-label="Toggle dark mode"
      on:click={toggleDarkMode}
      on:keydown={toggleDarkMode}
      tabindex="0"
      type="button"
    >
      {#if darkMode}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 3v1m0 16v1m8.66-10.66l-.707.707M4.34 12l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
          />
        </svg>
      {/if}
    </button>
  </div>

  <Adsense />
  <Analytics />
</header>
