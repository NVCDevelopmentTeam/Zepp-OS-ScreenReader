<script>
  import { siteTitle, githubLink, accessKey, discordChat } from '$lib/info.js';
  import Dialog from '$lib/components/Dialog.svelte';
  import CollapsibleSection from '$lib/components/CollapsibleSection.svelte';

  let dialog = $state();
  let status = $state("");
  let agree = $state(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    status = 'Submitting...';

    try {
      const formData = new FormData(event.currentTarget);
      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: json,
      });

      const result = await response.json();

      if (result.success) {
        status = "Feedback sent! Thank you.";
        setTimeout(() => dialog.close(), 2000);
      } else {
        status = result.message || "Submission failed.";
      }
    } catch (_) {
      console.error('Submission error:', _);
      status = "Error submitting form.";
    }
  };

  const faqs = [
    {
      q: 'What is ZSR?',
      a: 'Zepp OS Screen reader (ZSR) is a professional accessibility feature designed for visually impaired users. It uses advanced speech synthesis to read on-screen content, enabling full device interaction without visual reliance.'
    },
    {
      q: 'How do I enable ZSR?',
      a: 'Navigate to Settings > Accessibility > Screen Reader on your Zepp OS device and toggle the switch to ON.'
    },
    {
      q: 'Basic Gestures',
      a: '→ Swipe up/down: Navigate items\n→ Double-tap: Select/Activate\n→ Swipe left/right: Switch screens\n→ Long press: Voice assistant'
    },
    {
      q: 'Supported Languages',
      a: 'ZSR currently supports English, Chinese, Japanese, Korean, German, French, Spanish, Portuguese, Russian, and Italian.'
    }
  ];
</script>

<svelte:head>
  <title>Support | {siteTitle}</title>
</svelte:head>

<div class="container py-20 md:py-32 reveal-up">
  <header class="text-center mb-32">
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10">
      Support Center
    </div>
    <h1 class="text-6xl md:text-8xl lg:text-9xl font-black mb-12 leading-[0.9] tracking-tighter uppercase">
      Help & <br /> <span class="text-blue-600">Guidance</span>
    </h1>
    <p class="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
      Troubleshooting tips, FAQs, and everything you need to know about ZSR.
    </p>
  </header>

  <div class="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
    
    <!-- Left: FAQ & Content -->
    <div class="lg:col-span-2 space-y-16">
      
      <section>
        <div class="flex items-center gap-4 mb-12">
          <div class="w-1 h-8 bg-blue-600 rounded-full"></div>
          <h2 class="text-3xl font-black uppercase tracking-tighter">Frequently Asked Questions</h2>
        </div>
        <div class="space-y-6">
          {#each faqs as faq (faq.q)}
            <CollapsibleSection headerText={faq.q}>
              <div class="prose dark:prose-invert py-4 text-gray-500 font-medium whitespace-pre-line leading-relaxed">
                {faq.a}
              </div>
            </CollapsibleSection>
          {/each}
        </div>
      </section>

      <section class="card glass border-blue-500/5 p-10 md:p-16">
        <h2 class="text-3xl font-black uppercase tracking-tighter mb-8">Troubleshooting</h2>
        <div class="grid md:grid-cols-2 gap-10">
          <div class="space-y-4">
            <div class="w-12 h-12 rounded-xl bg-blue-500 text-white flex-center shadow-lg shadow-blue-500/20">
              <div class="i-lucide-rotate-ccw w-6 h-6"></div>
            </div>
            <h3 class="text-xl font-black uppercase tracking-tight">Restart Device</h3>
            <p class="text-sm text-gray-500 leading-relaxed font-medium">A quick restart solves 90% of temporary performance issues on Zepp OS devices.</p>
          </div>
          <div class="space-y-4">
            <div class="w-12 h-12 rounded-xl bg-blue-500 text-white flex-center shadow-lg shadow-blue-500/20">
              <div class="i-lucide-refresh-cw w-6 h-6"></div>
            </div>
            <h3 class="text-xl font-black uppercase tracking-tight">Update ZSR</h3>
            <p class="text-sm text-gray-500 leading-relaxed font-medium">Ensure you have the latest version from the App Store for the best accessibility support.</p>
          </div>
        </div>
      </section>
    </div>

    <!-- Right: Sidebar Support Options -->
    <aside class="space-y-8">
      <div class="card bg-zeppDark text-white p-10 border-none relative overflow-hidden group dark">
        <div class="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/30 blur-[60px] group-hover:bg-blue-600/50 transition-all duration-700"></div>
        <h3 class="text-2xl font-black uppercase tracking-tighter mb-6 relative z-10">Expert Help</h3>
        <p class="text-gray-400 mb-10 text-sm font-medium leading-relaxed relative z-10">
          Connect with our development team directly via Discord or GitHub for complex technical queries.
        </p>
        <div class="space-y-4 relative z-10">
          <a href={discordChat} class="btn bg-white text-zeppDark w-full justify-between gap-3 py-4 text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
            Discord Community
            <div class="i-lucide-message-circle w-4 h-4"></div>
          </a>
          <a href={githubLink} class="btn bg-white/10 text-white w-full justify-between gap-3 py-4 text-xs font-black uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all">
            GitHub Issues
            <div class="i-lucide-github w-4 h-4"></div>
          </a>
        </div>
      </div>

      <div class="card p-10 flex flex-col items-center text-center">
        <div class="w-16 h-16 rounded-full bg-blue-500/10 text-blue-600 flex-center mb-6">
          <div class="i-lucide-heart w-8 h-8"></div>
        </div>
        <h3 class="text-xl font-black uppercase mb-4 tracking-tight">Feedback</h3>
        <p class="text-sm text-gray-500 mb-8 font-medium">Help us shape the future of ZSR with your insights.</p>
        <button 
          onclick={() => dialog.showModal()}
          class="btn-primary w-full py-4 text-xs uppercase tracking-widest"
        >
          Send Feedback
        </button>
      </div>
    </aside>
  </div>
</div>

<Dialog bind:dialog>
  <div class="p-4">
    <h2 class="text-4xl font-black uppercase tracking-tighter mb-4 leading-none">Feedback</h2>
    <p class="text-gray-500 font-medium mb-12">How can we improve your experience?</p>

    <form onsubmit={handleSubmit} class="space-y-8">
      <input type="hidden" name="access_key" value={accessKey} />
      
      <div class="space-y-3">
        <label for="support-email" class="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Your Email</label>
        <input class="input-field" type="email" id="support-email" name="email" required placeholder="name@example.com" />
      </div>

      <div class="space-y-3">
        <label for="support-feedback" class="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Message</label>
        <textarea class="input-field min-h-[150px] resize-none" id="support-feedback" name="feedback" required placeholder="Tell us more..."></textarea>
      </div>

      <div class="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
        <input type="checkbox" id="support-agree" bind:checked={agree} class="mt-1 accent-blue-600 w-5 h-5" />
        <label for="support-agree" class="text-xs text-gray-500 font-medium leading-relaxed">
          I agree to the <a href="/privacy-policy" class="text-blue-600 font-bold hover:underline">Privacy Policy</a> and terms.
        </label>
      </div>

      <div class="flex flex-col gap-4 pt-6">
        <button type="submit" disabled={!agree || status === 'Submitting...'} class="btn-primary w-full py-5 text-xs font-black uppercase tracking-widest">
          {status === 'Submitting...' ? 'Processing...' : 'Submit Feedback'}
        </button>
        <button type="button" onclick={() => dialog.close()} class="btn-secondary w-full py-4 text-xs font-black uppercase tracking-widest border-none">Cancel</button>
      </div>
      
      {#if status && status !== 'Submitting...'}
        <div 
          aria-live="polite"
          class="text-center p-4 rounded-2xl bg-blue-500/10 text-blue-600 font-bold text-xs uppercase tracking-widest"
        >
          {status}
        </div>
      {/if}
    </form>
  </div>
</Dialog>
