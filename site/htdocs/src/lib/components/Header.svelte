<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import Adsense from './Adsense.svelte';
  import Analytics from './Analytics.svelte';
  import logo from '$lib/images/logo.jpg?w=100&format=webp';
  import { browser } from '$app/environment';
  import { githubLink, discordChat, zeppOSDev } from '$lib/info.js';

  // State using Svelte 5 reactivity
  let expanded = $state(false);
  let expandedDropdown = $state(false);
  let darkMode = $state(false);

  // Track the current path to detect meaningful route changes
  let currentPath = $page.url.pathname;

  // Function to toggle mobile menu
  function toggleMobileMenu() {
    expanded = !expanded;
    console.log('Mobile menu toggled. Expanded:', expanded);
  }

  // Function to toggle dropdown menu
  function toggleDropdown() {
    expandedDropdown = !expandedDropdown;
    console.log('Dropdown toggled. ExpandedDropdown:', expandedDropdown);
  }

  // Close dropdown when clicking outside
  function closeDropdown(event) {
    if (!event.target.closest('.dropdown')) {
      expandedDropdown = false;
      console.log('Dropdown closed due to outside click.');
    }
  }

  // Function to update the dark mode state based on the stored preference
  function updateDarkModeState() {
    if (browser) {
      const savedPreference = localStorage.getItem('darkMode');
      darkMode = savedPreference ? savedPreference === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      console.log('Dark mode state updated from storage:', darkMode);
    }
  }

  // Apply dark mode class based on state
  function applyDarkMode() {
    if (browser) {
      document.documentElement.classList.toggle('dark', darkMode);
      console.log('Dark mode applied. Current state:', darkMode);
    }
  }

  // Toggle dark mode on button click
  function toggleDarkMode() {
    if (browser) {
      darkMode = !darkMode;
      localStorage.setItem('darkMode', darkMode.toString());
      applyDarkMode(); // Ensure the DOM reflects the change immediately
      console.log('Dark mode toggled. New state:', darkMode);
    }
  }

  // Update the state when the component mounts
  onMount(() => {
    if (browser) {
      updateDarkModeState();
      applyDarkMode();

      // Add listener for system preference changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        if (!localStorage.getItem('darkMode')) {
          darkMode = e.matches;
          applyDarkMode();
        }
      };
      mediaQuery.addEventListener('change', handleChange);

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  });

  // Watch for route changes and close menus using $effect
  $effect(() => {
    const newPath = $page.url.pathname;
    if (newPath !== currentPath) {
      currentPath = newPath;
      expanded = false;
      expandedDropdown = false;
      console.log('Route changed. Menus closed.');
    }
  });
</script>

<header id="top" class="bg-white dark:bg-gray-900 shadow-md sticky top-0 w-full z-50">
  <div class="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
    <!-- Logo -->
    <a href="/" class="flex items-center">
      <img src={logo} alt="ZSR logo" class="h-10 w-auto" loading="lazy" />
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
      onclick={toggleMobileMenu}
      aria-expanded={expanded}
      aria-label="Toggle navigation"
    >
      <span class="sr-only">Toggle navigation</span>
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
    </button>

    <!-- Main Navigation -->
    <nav id="nav" class={`${expanded ? 'block' : 'hidden'} lg:block`}>
      <ul class="flex flex-col lg:flex-row lg:space-x-6 text-gray-800 dark:text-gray-200 px-4 py-3 lg:p-0">
        <li>
          <a 
            href="/" 
            class="hover:underline py-2 lg:py-0 block" 
            aria-current={$page.url.pathname === '/' ? 'page' : undefined}
          >
            Home
          </a>
        </li>
        <li>
          <a 
            href="/news" 
            class="hover:underline py-2 lg:py-0 block" 
            aria-current={$page.url.pathname === '/news' ? 'page' : undefined}
          >
            News
          </a>
        </li>

        <!-- Dropdown Menu for Other Services -->
        <li class="relative">
          <button
            onclick={toggleDropdown}
            class="hover:underline py-2 lg:py-0 w-full text-left lg:w-auto block"
            aria-haspopup="true"
            aria-expanded={expandedDropdown}
          >
            Other Services
          </button>
          {#if expandedDropdown}
            <ul class="absolute bg-white dark:bg-gray-800 shadow-md mt-2 rounded-md space-y-2 lg:space-y-0 w-full lg:w-48 z-20 dropdown">
              <li>
                <a 
                  href={githubLink} 
                  class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" 
                  title="Github repository"
                >
                  Github
                </a>
              </li>
              <li>
                <a 
                  href={discordChat} 
                  class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" 
                  title="Discord chat"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="/support"
                  class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Support page"
                  aria-current={$page.url.pathname === '/support' ? 'page' : undefined}
                >
                  Support
                </a>
              </li>
              <li>
                <a 
                  href={zeppOSDev} 
                  class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Zepp OS Developer
                </a>
              </li>
            </ul>
          {/if}
        </li>

        <li>
          <a 
            href="/about" 
            class="hover:underline py-2 lg:py-0 block" 
            aria-current={$page.url.pathname === '/about' ? 'page' : undefined}
          >
            About
          </a>
        </li>
        <li>
          <a 
            href="/contact" 
            class="hover:underline py-2 lg:py-0 block" 
            aria-current={$page.url.pathname === '/contact' ? 'page' : undefined}
          >
            Contact
          </a>
        </li>
      </ul>
    </nav>

    <!-- Dark Mode Toggle -->
    <div class="flex items-center px-4 py-3 lg:p-0">
      <i>Theme</i>
      <button
        onclick={toggleDarkMode}
        aria-label="Toggle dark mode"
        aria-pressed={darkMode}
        class="ml-2 p-2 bg-gray-200 dark:bg-gray-700 rounded text-gray-800 cursor-pointer dark:text-gray-200"
      >
        <div class="hidden dark:block">🌙</div>
        <div class="dark:hidden">☀️</div>
      </button>
    </div>
  </div>

  <!-- Lazy-load Adsense and Analytics components -->
  {#if true}
    <Adsense />
    <Analytics />
  {/if}
</header>
