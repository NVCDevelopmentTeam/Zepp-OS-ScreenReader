<script>
  import { siteAuthor, siteTitle } from '$lib/info.js';
  import logo from '$lib/images/logo.jpg?w=48&format=webp';

  let year = new Date().getFullYear();

  const links = [
    { label: 'About', href: '/about' },
    { label: 'News', href: '/news' },
    { label: 'Contact', href: '/contact' },
    { label: 'Accessibility', href: '/accessibility-statement' },
    { label: 'Support', href: '/support' },
    { label: 'Privacy', href: '/privacy-policy' }
  ];
</script>

<footer class="mt-auto bg-white dark:bg-zeppDark border-t border-gray-100 dark:border-white/5 pt-24 pb-12 overflow-hidden relative">
  <!-- Subtle decoration -->
  <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-500/5 to-transparent blur-[100px] -z-10" aria-hidden="true"></div>
  
  <div class="container relative z-10">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
      
      <!-- Brand & Description -->
      <div class="lg:col-span-2">
        <div class="flex items-center gap-3 mb-8">
          <img src={logo} alt="" class="w-10 h-10 rounded-xl" aria-hidden="true" />
          <span class="font-display font-black text-2xl tracking-tighter uppercase">
            <span class="text-blue-600">ZEPP</span> <span class="text-gray-900 dark:text-white">OS</span>
          </span>
        </div>
        <p class="text-gray-600 dark:text-gray-400 max-w-sm mb-8 leading-relaxed font-medium">
          The first professional screen reader for Zepp OS devices. Empowering blind and low-vision users to experience the full potential of their smart wearables.
        </p>
        <div class="flex items-center gap-4">
          <a href="https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader" target="_blank" class="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex-center hover:text-blue-600 hover:border-blue-500 transition-all shadow-sm group" aria-label="ZSR on GitHub">
            <div class="i-lucide-github w-5 h-5 group-hover:scale-110 transition-transform" aria-hidden="true"></div>
          </a>
          <a href="https://discord.gg/DAZU3E4mSP" target="_blank" class="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex-center hover:text-blue-600 hover:border-blue-500 transition-all shadow-sm group" aria-label="ZSR on Discord">
            <div class="i-lucide-message-circle w-5 h-5 group-hover:scale-110 transition-transform" aria-hidden="true"></div>
          </a>
        </div>
      </div>

      <!-- Quick Links -->
      <nav aria-label="Footer Navigation">
        <h2 class="font-black text-gray-900 dark:text-white mb-8 uppercase text-xs tracking-[0.2em]">Site</h2>
        <ul class="space-y-4">
          {#each links as link (link.href)}
            <li>
              <a href={link.href} class="text-gray-600 dark:text-gray-400 hover:text-blue-600 font-bold transition-colors text-sm uppercase tracking-wide">
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      </nav>

      <!-- Project Info -->
      <section>
        <h2 class="font-black text-gray-900 dark:text-white mb-8 uppercase text-xs tracking-[0.2em]">Contact</h2>
        <div class="space-y-6">
          <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex-center shrink-0" aria-hidden="true">
              <div class="i-lucide-map-pin text-blue-500 w-4 h-4"></div>
            </div>
            <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">{siteAuthor}</span>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex-center shrink-0" aria-hidden="true">
              <div class="i-lucide-mail text-blue-500 w-4 h-4"></div>
            </div>
            <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">
              <a href="mailto:contact@zeppreader.com" class="text-blue-700 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">contact@zeppreader.com</a>
            </span>
          </div>
        </div>
      </section>
    </div>

    <!-- Bottom Bar -->
    <div class="pt-10 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
      <p class="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
        © {year} {siteTitle}
      </p>
      <a href="#top" class="group flex items-center gap-3 text-xs font-black text-blue-700 dark:text-blue-500 uppercase tracking-widest hover:translate-y-[-2px] transition-transform" aria-label="Back to top">
        Top 
        <div class="w-8 h-8 rounded-full bg-blue-500/10 flex-center group-hover:bg-blue-600 group-hover:text-white transition-all" aria-hidden="true">
          <div class="i-lucide-arrow-up w-4 h-4"></div>
        </div>
      </a>
    </div>
  </div>
</footer>
