<script>
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import Adsense from './Adsense.svelte';
  import Analytics from './Analytics.svelte';
  import logo from '$lib/images/logo.jpg';
  import { githubLink, discordChat, zeppOSDev } from '$lib/info.js';

  let expanded = false; // Mobile menu toggle
  let expandedDropdown = false; // Dropdown menu toggle
  let darkMode = false;

  function toggle() {
    darkMode = !darkMode;
    // Only manipulate DOM in the browser, not during SSR
    if (browser) {
      window.document.body.classList.toggle('dark');
    }
  }
</script>

<header id="top" class="bg-white dark:bg-gray-800 shadow-md fixed top-0 w-full z-10">
  <div class="flex items-center justify-between px-4 py-3">
    <!-- Logo -->
    <a href="/" class="flex items-center">
      <img src={logo} alt="ZSR logo" class="h-10 w-auto" />
    </a>

    <!-- Skip Links for Accessibility -->
    <ul class="sr-only">
      <li><a href="#nav">Skip to main navigation</a></li>
      <li><a href="#main">Skip to main content</a></li>
      <li><a href="#footer">Skip to footer</a></li>
    </ul>

    <!-- Mobile Menu Toggle -->
    <button
      class="lg:hidden text-gray-800 dark:text-gray-200"
      on:click={() => (expanded = !expanded)}
      aria-expanded={expanded}
      aria-label="Toggle navigation"
    >
      <span class="sr-only">Toggle navigation</span>
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
    </button>
  </div>

  <!-- Main Navigation -->
  <nav id="nav" class={`lg:flex ${expanded ? 'block' : 'hidden'} lg:block`}>
    <ul class="flex flex-col lg:flex-row lg:space-x-6 text-gray-800 dark:text-gray-200">
      <li>
        <a href="/" class="hover:underline" aria-current={$page.url.pathname === '/' ? 'page' : undefined}>Home</a>
      </li>
      <li>
        <a href="/news" class="hover:underline" aria-current={$page.url.pathname === '/news' ? 'page' : undefined}>News</a>
      </li>

      <!-- Dropdown Menu for Other Services -->
      <li class="relative">
        <button
role="link" 
          class="hover:underline"
          aria-haspopup="true"
          aria-expanded={expandedDropdown}
          on:click={() => (expandedDropdown = !expandedDropdown)}
        >
          Other Services
        </button>
        {#if expandedDropdown}
          <ul class="absolute bg-white dark:bg-gray-800 shadow-md mt-2 rounded-md space-y-2">
            <li>
              <a href={githubLink} class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" title="Github repository">Github</a>
            </li>
            <li>
              <a href={discordChat} class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" title="Discord chat">Discord</a>
            </li>
            <li>
              <a
                href="/support"
                class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Support page"
                aria-current={$page.url.pathname === '/support' ? 'page' : undefined}
              >Support</a>
            </li>
            <li>
              <a href={zeppOSDev} class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Zepp OS Developer</a>
            </li>
          </ul>
        {/if}
      </li>

      <li>
        <a href="/about" class="hover:underline" aria-current={$page.url.pathname === '/about' ? 'page' : undefined}>About</a>
      </li>
      <li>
        <a href="/contact" class="hover:underline" aria-current={$page.url.pathname === '/contact' ? 'page' : undefined}>Contact</a>
      </li>
    </ul>
  </nav>

  <!-- Dark Mode Toggle -->
  <div class="px-4 py-3 flex items-center">
    <i>Theme</i>
    <button
      on:click={toggle}
      class="ml-2 text-gray-800 dark:text-gray-200 focus:outline-none"
      aria-label="Toggle dark mode"
      aria-pressed={darkMode}
    >
      <span class="sr-only">Toggle dark mode</span>
      <span class="text-sm">{darkMode ? 'Go light' : 'Go dark'}</span>
      <span class="ml-1" aria-hidden="true">{darkMode ? '🌞' : '🌙'}</span>
    </button>
  </div>

  <Analytics />
  <Adsense />
</header>