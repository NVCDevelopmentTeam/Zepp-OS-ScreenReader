<script>
  import { siteTitle } from '#lib/info.js';
  import Contact from '#lib/components/Contact.svelte';
</script>

<svelte:head>
  <title>Contact | {siteTitle}</title>
  <meta name="description" content="Get in touch with the ZSR development team." />
</svelte:head>

<div class="container py-20 md:py-32 reveal-up">
  <div class="max-w-4xl mx-auto">
    <header class="text-center mb-24">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-10">
        Get in touch
      </div>
      <h1 class="text-4xl min-[420px]:text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-12 leading-[0.9] tracking-tighter uppercase">
        Let's <br /> <span class="text-blue-600 dark:text-blue-400">Connect</span>
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
        Have questions about ZSR? Our team is here to help you get the most out of your wearable accessibility experience.
      </p>
    </header>

    <div class="grid md:grid-cols-3 gap-6 mb-24">
      <div class="card p-8 flex flex-col items-center text-center group">
        <div class="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex-center mb-6 group-hover:scale-110 transition-transform duration-500">
          <div class="i-lucide-mail w-6 h-6" aria-hidden="true"></div>
        </div>
        <h2 class="text-xs font-black uppercase tracking-widest mb-2">Email</h2>
        <a href="mailto:contact@zeppreader.com" class="text-sm font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors">contact@zeppreader.com</a>
      </div>

      <div class="card p-8 flex flex-col items-center text-center group">
        <div class="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex-center mb-6 group-hover:scale-110 transition-transform duration-500">
          <div class="i-lucide-message-circle w-6 h-6" aria-hidden="true"></div>
        </div>
        <h2 class="text-xs font-black uppercase tracking-widest mb-2">Discord</h2>
        <a href="https://discord.gg/DAZU3E4mSP" target="_blank" class="text-sm font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Join Community</a>
      </div>

      <div class="card p-8 flex flex-col items-center text-center group">
        <div class="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex-center mb-8 group-hover:scale-110 transition-transform duration-500">
          <div class="i-lucide-github w-6 h-6" aria-hidden="true"></div>
        </div>
        <h2 class="text-xs font-black uppercase tracking-widest mb-2">GitHub</h2>
        <a href="https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader/issues" target="_blank" class="text-sm font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Report Issues</a>
      </div>
    </div>

    <div class="card glass p-10 md:p-16">
      <div class="flex items-center gap-4 mb-12">
        <div class="w-1 h-8 bg-blue-600 rounded-full" aria-hidden="true"></div>
        <h2 class="text-3xl font-black uppercase tracking-tighter">Send a message</h2>
      </div>
      <Contact />
    </div>
  </div>
</div>
