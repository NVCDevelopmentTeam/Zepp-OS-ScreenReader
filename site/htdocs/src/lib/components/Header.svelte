<script>
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { githubLink, discordChat, zeppOSDev } from '$lib/info.js';
  import logo from '$lib/images/logo.jpg?w=64&format=webp';
  import Adsense from './Adsense.svelte';
  import Analytics from './Analytics.svelte';

  let expanded = $state(false);
  let expandedDropdown = $state(false);
  let darkMode = $state(false);

  function toggleMobileMenu() {
    expanded = !expanded;
  }

  function toggleDropdown(event) {
    event.stopPropagation();
    expandedDropdown = !expandedDropdown;
  }

  function toggleDarkMode() {
    darkMode = !darkMode;
    if (browser) {
      document.documentElement.classList.toggle('dark', darkMode);
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }
  }

  $effect(() => {
    // Close menus on navigation
    // eslint-disable-next-line no-unused-vars
    const path = page.url.pathname;
    expanded = false;
    expandedDropdown = false;
  });

  onMount(() => {
    if (browser) {
      // Sync darkMode state with DOM (initialized in app.html)
      darkMode = document.documentElement.classList.contains('dark');

      const closeMenus = (e) => {
        if (!e.target.closest('.dropdown-container')) {
          expandedDropdown = false;
        }
      };

      document.addEventListener('click', closeMenus);
      return () => document.removeEventListener('click', closeMenus);
    }
  });

  const primaryNav = [
    { label: 'Home', href: '/' },
    { label: 'News', href: '/news' },
    { label: 'About', href: '/about' }
  ];

  const secondaryNav = [
    { label: 'Support', href: '/support' },
    { label: 'Accessibility', href: '/accessibility-statement' },
    { label: 'Contact', href: '/contact' }
  ];
</script>

<!-- Skip Link for Accessibility -->
<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-blue-600 focus:text-white focus:rounded-full focus:font-bold">
  Skip to content
</a>

<header class="fixed top-0 z-50 w-full">
  <!-- Secondary Utility Bar (Small) -->
  <div class="h-8 bg-gray-50/80 dark:bg-zeppDark/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 hidden md:block">
    <div class="container h-full flex justify-end items-center gap-6">
      {#each secondaryNav as item (item.href)}
        <a 
          href={item.href} 
          class="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
          aria-current={page.url.pathname === item.href ? 'page' : undefined}
        >
          {item.label}
        </a>
      {/each}
    </div>
  </div>

  <!-- Primary Navigation Bar (Large) -->
  <div class="h-16 md:h-20 glass border-b border-gray-100/50 dark:border-white/5 flex items-center">
    <div class="container flex-between h-full">
      
      <!-- Logo & Brand -->
      <a href="/" class="flex items-center gap-3 group" aria-label="Zepp OS Screen Reader Home">
        <div class="relative w-9 h-9 md:w-11 md:h-11 overflow-hidden rounded-xl ring-2 ring-blue-500/10 group-hover:ring-blue-500/30 transition-all duration-500">
          <img src={logo} alt="" width="44" height="44" class="w-full h-full object-cover" />
        </div>
        <span class="font-display font-black text-lg md:text-xl tracking-tighter uppercase" aria-hidden="true">
          <span class="text-blue-600">ZEPP</span> <span class="text-gray-900 dark:text-white">OS</span>
        </span>
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden lg:flex items-center gap-10">
        {#each primaryNav as item (item.href)}
          {@const isActive = page.url.pathname === item.href}
          <a 
            href={item.href} 
            class="nav-link relative group/item {isActive ? 'text-blue-600' : ''}"
            aria-current={isActive ? 'page' : undefined}
          >
            {item.label}
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover/item:w-full {isActive ? 'w-full' : ''}" aria-hidden="true"></span>
          </a>
        {/each}

        <!-- Dropdown -->
        <div class="relative dropdown-container">
          <button 
            onclick={toggleDropdown}
            class="nav-link flex items-center gap-1.5 focus:outline-none"
            aria-expanded={expandedDropdown}
            aria-haspopup="true"
          >
            Resources <div class="i-lucide-chevron-down text-[10px] transition-transform duration-300" class:rotate-180={expandedDropdown} aria-hidden="true"></div>
          </button>

          {#if expandedDropdown}
            <div 
              class="absolute top-full right-0 mt-4 w-60 glass rounded-2xl shadow-2xl border border-white/20 dark:border-white/5 py-3 animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden"
              role="menu"
            >
              <a href={discordChat} target="_blank" class="flex items-center gap-3 px-5 py-3 hover:bg-blue-500/10 transition-colors" role="menuitem">
                <div class="i-lucide-message-circle text-blue-500" aria-hidden="true"></div> 
                <span class="text-sm font-bold">Discord</span>
              </a>
              <a href={githubLink} target="_blank" class="flex items-center gap-3 px-5 py-3 hover:bg-blue-500/10 transition-colors" role="menuitem">
                <div class="i-lucide-github" aria-hidden="true"></div> 
                <span class="text-sm font-bold">GitHub</span>
              </a>
              <div class="h-px bg-gray-100 dark:bg-white/5 my-2 mx-5" role="separator"></div>
              <a href={zeppOSDev} target="_blank" class="flex items-center gap-3 px-5 py-3 hover:bg-blue-500/10 transition-colors" role="menuitem">
                <div class="i-lucide-external-link text-gray-600 dark:text-gray-400" aria-hidden="true"></div> 
                <span class="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">Developer Portal</span>
              </a>
            </div>
          {/if}
        </div>
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <!-- Dark Mode Toggle -->
        <button
          onclick={toggleDarkMode}
          class="w-10 h-10 md:w-11 md:h-11 rounded-full flex-center bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all active:scale-90"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {#if darkMode}
            <div class="i-lucide-sun w-5 h-5" aria-hidden="true"></div>
          {:else}
            <div class="i-lucide-moon w-5 h-5" aria-hidden="true"></div>
          {/if}
        </button>

        <!-- Mobile Menu Toggle -->
        <button
          onclick={toggleMobileMenu}
          class="lg:hidden w-10 h-10 md:w-11 md:h-11 rounded-full flex-center bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-400 transition-all active:scale-90"
          aria-label={expanded ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={expanded}
        >          {#if expanded}
            <div class="i-lucide-x w-6 h-6" aria-hidden="true"></div>
          {:else}
            <div class="i-lucide-menu w-6 h-6" aria-hidden="true"></div>
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile Nav -->
  {#if expanded}
    <div class="lg:hidden fixed inset-x-0 top-16 md:top-20 glass border-b border-gray-100 dark:border-white/5 p-6 space-y-4 animate-in slide-in-from-top-8 duration-500 shadow-2xl max-h-[80vh] overflow-y-auto">
      <nav class="grid grid-cols-1 gap-2">
        <div class="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest px-4 mb-2">Main Menu</div>
        {#each primaryNav as item (item.href)}
          {@const isActive = page.url.pathname === item.href}
          <a 
            href={item.href} 
            class="flex items-center justify-between p-4 rounded-2xl transition-all {isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-50 dark:bg-white/5'}"
            aria-current={isActive ? 'page' : undefined}
          >
            <span class="font-bold tracking-widest uppercase text-xs">{item.label}</span>
            <div class="i-lucide-chevron-right text-sm opacity-50" aria-hidden="true"></div>
          </a>
        {/each}
        
        <div class="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest px-4 mt-6 mb-2">Support & Info</div>
        {#each secondaryNav as item (item.href)}
          {@const isActive = page.url.pathname === item.href}
          <a 
            href={item.href} 
            class="flex items-center justify-between p-4 rounded-2xl transition-all {isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-50 dark:bg-white/5'}"
            aria-current={isActive ? 'page' : undefined}
          >
            <span class="font-bold tracking-widest uppercase text-xs">{item.label}</span>
            <div class="i-lucide-chevron-right text-sm opacity-50" aria-hidden="true"></div>
          </a>
        {/each}
      </nav>
      
      <div class="pt-6 border-t border-gray-100 dark:border-white/5 grid grid-cols-2 gap-3">
        <a href={discordChat} class="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-blue-500/10 transition-colors">
          <div class="i-lucide-message-circle text-blue-500" aria-hidden="true"></div>
          <span class="text-[10px] font-black uppercase tracking-tighter text-gray-600 dark:text-gray-400">Discord</span>
        </a>
        <a href={githubLink} class="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-blue-500/10 transition-colors">
          <div class="i-lucide-github" aria-hidden="true"></div>
          <span class="text-[10px] font-black uppercase tracking-tighter text-gray-600 dark:text-gray-400">GitHub</span>
        </a>
      </div>
    </div>
  {/if}

  <Adsense />
  <Analytics />
</header>
