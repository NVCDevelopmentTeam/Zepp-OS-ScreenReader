<script>
  import PostsList from '$lib/components/PostsList.svelte';
  import { siteTitle, siteDescription } from '$lib/info.js';
  let { data } = $props();
</script>

<svelte:head>
  <title>Home | {siteTitle}</title>
  <meta name="description" content={siteDescription} />
</svelte:head>

<div class="space-y-32 pb-32">
  <!-- Hero Section -->
  <section class="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
    <!-- Hero Background with Overlay -->
    <div class="absolute inset-0 z-0">
      <enhanced:img
        src="$lib/images/background.jpg"
        alt=""
        class="w-full h-full object-cover"
        loading="eager"
        fetchpriority="high"
      />
      <div class="absolute inset-0 bg-white/60 dark:bg-zeppDark/80 backdrop-blur-[2px]"></div>
    </div>

    <div class="relative z-10 container text-center reveal-up">
      <div class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-10">
        <div class="i-lucide-zap w-4 h-4" aria-hidden="true"></div>
        <span>Powering Accessibility</span>
      </div>
      
      <h1 class="text-6xl md:text-8xl lg:text-9xl font-black mb-10 leading-[0.9] tracking-tighter">
        ZEPP OS <br /> 
        <span class="text-blue-600">SCREEN READER</span>
      </h1>
      
      <p class="text-lg md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed mb-14 font-medium">
        The ultimate accessibility tool for your smartwatch. 
        Experience the future of wearable technology through sound and touch.
      </p>
      
      <div class="flex flex-wrap justify-center gap-6">
        <a href="/news" class="btn-primary group">
          Get Started 
          <div class="i-lucide-arrow-right w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" aria-hidden="true"></div>
        </a>
        <a href="/about" class="btn-secondary">
          Explore Features
        </a>
      </div>
    </div>
  </section>

  <!-- Features Grid -->
  <section class="container">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 reveal-up">
      <div class="max-w-2xl">
        <h2 class="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter">Why choose ZSR?</h2>
        <p class="text-xl text-gray-500 font-medium leading-relaxed">
          Designed with a focus on speed, reliability, and ease of use. 
          Empowering you to stay connected wherever you are.
        </p>
      </div>
      <div class="hidden md:block h-px flex-grow bg-gray-100 dark:bg-white/10 mx-10 mb-6" aria-hidden="true"></div>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div class="card group reveal-up" style="animation-delay: 0.1s">
        <div class="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 flex-center mb-8 group-hover:scale-110 transition-transform duration-500">
          <div class="i-lucide-volume-2 w-8 h-8" aria-hidden="true"></div>
        </div>
        <h3 class="text-2xl font-black mb-4 uppercase tracking-tight">Voice Feedback</h3>
        <p class="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">Crystal clear text-to-speech engine that describes every element on your watch face and in apps.</p>
      </div>

      <div class="card group reveal-up" style="animation-delay: 0.2s">
        <div class="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 flex-center mb-8 group-hover:scale-110 transition-transform duration-500">
          <div class="i-lucide-move w-8 h-8" aria-hidden="true"></div>
        </div>
        <h3 class="text-2xl font-black mb-4 uppercase tracking-tight">Gesture Navigation</h3>
        <p class="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">Intuitive swipe and tap gestures designed for blind and low-vision users to navigate effortlessly.</p>
      </div>

      <div class="card group reveal-up" style="animation-delay: 0.3s">
        <div class="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 flex-center mb-8 group-hover:scale-110 transition-transform duration-500">
          <div class="i-lucide-shield-check w-8 h-8" aria-hidden="true"></div>
        </div>
        <h3 class="text-2xl font-black mb-4 uppercase tracking-tight">Reliable & Safe</h3>
        <p class="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">Optimized for Zepp OS with minimal battery impact and maximum security for your personal data.</p>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="container">
    <div class="relative overflow-hidden rounded-[3rem] bg-zeppDark p-10 md:p-20 text-white shadow-2xl reveal-up dark">
      <!-- Decoration -->
      <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent blur-[80px]" aria-hidden="true"></div>
      
      <div class="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 class="text-5xl md:text-7xl font-black mb-8 leading-[1] tracking-tighter uppercase">
            Start your <br /> 
            <span class="text-blue-500">accessible</span> journey.
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 mb-12 font-medium leading-relaxed">
            Download the Zepp OS Screen Reader today and transform your wearable experience. 
            Available on all Zepp OS compatible devices.
          </p>
          <div class="flex flex-wrap gap-6">
            <a href="https://developer.zepp.com/os/home" target="_blank" class="btn-primary">Get it on Zepp App Store</a>
          </div>
        </div>

        <div class="card glass border-white/5 p-10">
          <h3 class="text-2xl font-bold mb-8">Quick Setup</h3>
          <ul class="space-y-6">
            <li class="flex items-start gap-4">
              <div class="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex-center shrink-0" aria-hidden="true">1</div>
              <div>
                <p class="font-bold mb-1">Open Zepp App</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Navigate to the App Store on your smartphone.</p>
              </div>
            </li>
            <li class="flex items-start gap-4">
              <div class="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex-center shrink-0" aria-hidden="true">2</div>
              <div>
                <p class="font-bold mb-1">Search for ZSR</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Find our official screen reader in the utility section.</p>
              </div>
            </li>
            <li class="flex items-start gap-4">
              <div class="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex-center shrink-0" aria-hidden="true">3</div>
              <div>
                <p class="font-bold mb-1">Install & Enable</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Sync with your watch and enable it in the accessibility settings.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- Recent Posts -->
  <section class="container">
    <div class="flex items-center justify-between mb-16 reveal-up">
      <h2 class="text-3xl md:text-5xl font-black uppercase tracking-tighter">Latest News</h2>
      <a href="/news" class="nav-link flex items-center gap-2 group">
        All Updates <div class="i-lucide-arrow-right w-4 h-4 group-hover:translate-x-2 transition-transform" aria-hidden="true"></div>
      </a>
    </div>
    <div class="reveal-up" style="animation-delay: 0.2s">
      <PostsList posts={data.posts} />
    </div>
  </section>
</div>
