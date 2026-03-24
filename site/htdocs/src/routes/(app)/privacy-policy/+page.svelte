<script>
  import { siteTitle } from '$lib/info.js';
</script>

<svelte:head>
  <title>Privacy Policy | {siteTitle}</title>
  <meta name="description" content="Privacy Policy for Zepp OS Screen Reader (ZSR) website." />
</svelte:head>

<div class="container py-20 md:py-32 reveal-up">
  <div class="max-w-4xl mx-auto">
    <header class="text-center mb-24">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10">
        Data Protection
      </div>
      <h1 class="text-6xl md:text-8xl lg:text-9xl font-black mb-12 leading-[0.9] tracking-tighter uppercase">
        Privacy <br /> <span class="text-blue-600">Policy</span>
      </h1>
      <p class="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed italic">
        "Your trust is our most valuable asset. We are committed to protecting your personal data with the highest standards of security."
      </p>
    </header>

    <div class="card glass p-10 md:p-20 space-y-16">
      <article class="prose prose-lg dark:prose-invert max-w-none 
        prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter
        prose-p:text-gray-500 prose-p:font-medium prose-p:leading-relaxed">
        
        <p class="lead">
          The NVC Development Team values your privacy. This policy outlines our practices for data collection and usage when you access our website.
        </p>

        <h2>Data Collection</h2>
        <p>We may gather specific information during your visit, including:</p>
        <div class="not-prose grid md:grid-cols-2 gap-6 my-10">
          <div class="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <div class="i-lucide-smartphone text-blue-600 w-6 h-6 mb-4"></div>
            <h4 class="font-black uppercase text-xs tracking-widest mb-2">Device Info</h4>
            <p class="text-sm text-gray-500 font-medium m-0">Model, OS version, and unique identifiers.</p>
          </div>
          <div class="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <div class="i-lucide-activity text-blue-600 w-6 h-6 mb-4"></div>
            <h4 class="font-black uppercase text-xs tracking-widest mb-2">Usage Data</h4>
            <p class="text-sm text-gray-500 font-medium m-0">Features accessed and actions performed.</p>
          </div>
        </div>

        <h2>How We Use Your Data</h2>
        <p>
          The data collected is used to enhance website functionality, analyze usage patterns, maintain system security, and comply with legal obligations.
        </p>

        <h2>Security Measures</h2>
        <p>
          We implement industry-standard measures to protect your data from unauthorized access. However, please note that no digital transmission is 100% secure.
        </p>

        <div class="not-prose mt-16 p-8 bg-zeppDark rounded-[2rem] text-white border border-white/5 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl"></div>
          <p class="text-sm font-medium text-gray-400 m-0 relative z-10 leading-relaxed">
            By accessing the ZSR website, you consent to our <strong>End User License Agreement</strong> and <strong>Terms of Service</strong>.
          </p>
        </div>

        <p class="text-xs font-black uppercase tracking-widest text-gray-400 mt-12">
          Last updated: March 10, 2026
        </p>
      </article>
    </div>
  </div>
</div>
