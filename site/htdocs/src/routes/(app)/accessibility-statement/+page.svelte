<script>
  import { siteTitle } from '$lib/info.js';
</script>

<svelte:head>
  <title>Accessibility Statement | {siteTitle}</title>
  <meta name="description" content="Our commitment to making ZSR and this website accessible to everyone." />
</svelte:head>

<div class="container py-20 md:py-32 reveal-up">
  <div class="max-w-4xl mx-auto">
    <header class="text-center mb-24">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10">
        Inclusivity
      </div>
      <h1 class="text-6xl md:text-8xl lg:text-9xl font-black mb-12 leading-[0.9] tracking-tighter uppercase">
        Digital <br /> <span class="text-blue-600">Equality</span>
      </h1>
      <p class="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed italic">
        "Accessibility is not a feature, it's a human right. We are dedicated to ensuring everyone can experience ZSR."
      </p>
    </header>

    <div class="card glass p-10 md:p-20 space-y-16">
      <article class="prose prose-lg dark:prose-invert max-w-none 
        prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter
        prose-p:text-gray-500 prose-p:font-medium prose-p:leading-relaxed">
        
        <h2>Our Commitment</h2>
        <p>
          Zepp OS Screen Reader is specifically designed for visually impaired users and those with low vision. We take our responsibility seriously and strive to ensure that both our application and this website meet the highest accessibility standards.
        </p>

        <h2>Standards Compliance</h2>
        <p>
          We aim to comply with the <strong>Web Content Accessibility Guidelines (WCAG) 2.2 level AAA</strong>. Our development process includes regular testing with screen readers and other assistive technologies to ensure a seamless experience.
        </p>

        <div class="not-prose p-10 bg-blue-600 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group my-16">
          <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          <h3 class="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
            <div class="i-lucide-help-circle w-6 h-6"></div> Feedback & Support
          </h3>
          <p class="text-blue-50 font-medium mb-10 leading-relaxed">
            If you experience any difficulties using this website or have suggestions for how we can improve its accessibility, please don't hesitate to reach out.
          </p>
          <div class="flex flex-wrap gap-4">
            <a href="/contact" class="btn bg-white text-blue-600 px-8 py-4 text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Contact Us</a>
          </div>
        </div>

        <p class="text-xs font-black uppercase tracking-widest text-gray-400">
          Last updated: March 10, 2026
        </p>
      </article>
    </div>
  </div>
</div>
