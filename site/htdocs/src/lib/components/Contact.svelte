<script>
  import { accessKey } from '$lib/info.js';
  let status = $state('');
  let success = $state(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    status = 'Submitting...';

    const formData = new FormData(event.currentTarget);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
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
        status = "Message sent successfully! We'll get back to you soon.";
        success = true;
        event.target.reset();
      } else {
        status = "Something went wrong. Please try again later.";
        success = false;
      }
    } catch (_) {
      console.error('Submission error:', _);
      status = "Network error. Please check your connection.";
      success = false;
    }
  };
</script>

<form onsubmit={handleSubmit} class="space-y-8 max-w-2xl mx-auto">
  <input type="hidden" name="access_key" value={accessKey}>

  <div class="grid md:grid-cols-2 gap-8">
    <div class="space-y-3">
      <label for="contact-name" class="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
        Your Name <span class="text-blue-600">*</span>
      </label>
      <input 
        class="input-field" 
        type="text" id="contact-name" name="name" placeholder="John Doe" required 
      />
    </div>

    <div class="space-y-3">
      <label for="contact-email" class="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
        Your Email <span class="text-blue-600">*</span>
      </label>
      <input 
        class="input-field" 
        type="email" id="contact-email" name="email" placeholder="john@example.com" required 
      />
    </div>
  </div>

  <div class="space-y-3">
    <label for="contact-subject" class="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
      Subject <span class="text-blue-600">*</span>
    </label>
    <input 
      class="input-field" 
      type="text" id="contact-subject" name="title" placeholder="How can we help you?" required 
    />
  </div>

  <div class="space-y-3">
    <label for="contact-message" class="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
      Message <span class="text-blue-600">*</span>
    </label>
    <textarea 
      class="input-field min-h-[200px] resize-none" 
      id="contact-message" name="message" placeholder="Please describe your inquiry in detail..." required
    ></textarea>
  </div>

  <button 
    type="submit" 
    class="btn-primary w-full py-5 text-sm uppercase tracking-[0.2em]"
    disabled={status === 'Submitting...'}
  >
    {#if status === 'Submitting...'}
      <div class="i-lucide-loader-2 w-5 h-5 animate-spin mr-3" aria-hidden="true"></div> Sending...
    {:else}
      Send Message
    {/if}
  </button>
  
  {#if status && status !== 'Submitting...'}
    <div 
      aria-live="polite"
      class="flex items-center gap-4 p-6 rounded-3xl text-sm font-bold uppercase tracking-wider animate-in fade-in zoom-in duration-500 {success ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}"
    >
      <div class={success ? "i-lucide-check-circle" : "i-lucide-alert-circle"} aria-hidden="true"></div>
      {status}
    </div>
  {/if}
</form>
