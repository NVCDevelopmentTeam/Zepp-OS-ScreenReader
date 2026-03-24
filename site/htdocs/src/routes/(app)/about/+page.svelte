<script>
  import { siteTitle, githubLink, zeppOSDocs, zeppOSScreen } from '$lib/info.js';
</script>

<svelte:head>
  <title>About | {siteTitle}</title>
  <meta name="description" content="Learn more about ZSR - the Zepp OS Screen Reader." />
</svelte:head>

<div class="container py-20 md:py-32 reveal-up">
  <div class="max-w-4xl mx-auto">
    <header class="text-center mb-32">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10">
        Our Vision
      </div>
      <h1 class="text-6xl md:text-8xl lg:text-9xl font-black mb-12 leading-[0.9] tracking-tighter uppercase">
        Empowering <br /> <span class="text-blue-600">Sight</span>
      </h1>
      <p class="text-2xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto italic">
        "ZSR is more than an app; it's a bridge to digital independence for the visually impaired community."
      </p>
    </header>

    <div class="space-y-32">
      <section class="grid lg:grid-cols-2 gap-16 items-center">
        <div class="prose prose-lg dark:prose-invert">
          <h2 class="text-4xl font-black uppercase tracking-tighter mb-8">What is ZSR?</h2>
          <p class="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            ZSR (Zepp OS Screen Reader) is a professional accessibility service designed from the ground up for the Zepp operating system. It provides comprehensive auditory feedback and intuitive controls for smartwatches and fitness trackers.
          </p>
          <p class="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            Our technology translates visual information into clear, synthetic speech, allowing users to interact with their devices without needing to see the screen.
          </p>
        </div>
        <div class="relative group">
          <div class="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-purple-600 opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
          <div class="card glass relative z-10 p-12 aspect-square flex-center text-center">
            <div class="i-lucide-accessibility text-blue-600 w-32 h-32 mb-8" aria-hidden="true"></div>
            <p class="font-black text-xs uppercase tracking-[0.3em]">Accessibility First</p>
          </div>
        </div>
      </section>

      <section class="card bg-zeppDark text-white p-12 md:p-20 border-none relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px]" aria-hidden="true"></div>
        <div class="relative z-10 grid md:grid-cols-3 gap-12">
          <div class="md:col-span-2">
            <h2 class="text-4xl font-black uppercase tracking-tighter mb-8">Our Mission</h2>
            <p class="text-xl text-gray-300 font-medium leading-relaxed mb-10">
              Developed by the <strong>NVC Development Team</strong>, we are on a mission to make wearable technology inclusive. We believe in a world where everyone has equal access to the tools that keep us connected and healthy.
            </p>
            <div class="flex flex-wrap gap-6">
              <a href={githubLink} target="_blank" class="btn-primary group">
                Contribute on GitHub
                <div class="i-lucide-github w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" aria-hidden="true"></div>
              </a>
            </div>
          </div>
          <div class="flex-center" aria-hidden="true">
            <div class="w-px h-full bg-white/10 hidden md:block"></div>
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-4xl font-black uppercase tracking-tighter mb-16 text-center">Resources</h2>
        <div class="grid md:grid-cols-2 gap-8">
          <a href={zeppOSDocs} target="_blank" class="card group">
            <div class="flex items-center justify-between mb-6">
              <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex-center">
                <div class="i-lucide-book-open w-6 h-6" aria-hidden="true"></div>
              </div>
              <div class="i-lucide-arrow-up-right text-gray-300 group-hover:text-blue-500 transition-colors" aria-hidden="true"></div>
            </div>
            <h3 class="text-xl font-black uppercase mb-3">Developer Docs</h3>
            <p class="text-gray-500 text-sm font-medium">Deep dive into the Zepp OS ecosystem and APIs.</p>
          </a>
          <a href={zeppOSScreen} target="_blank" class="card group">
            <div class="flex items-center justify-between mb-6">
              <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex-center">
                <div class="i-lucide-layout w-6 h-6" aria-hidden="true"></div>
              </div>
              <div class="i-lucide-arrow-up-right text-gray-300 group-hover:text-blue-500 transition-colors" aria-hidden="true"></div>
            </div>
            <h3 class="text-xl font-black uppercase mb-3">Screen Adaptation</h3>
            <p class="text-gray-500 text-sm font-medium">Learn how to design for different smartwatch shapes.</p>
          </a>
        </div>
      </section>
    </div>
  </div>
</div>
