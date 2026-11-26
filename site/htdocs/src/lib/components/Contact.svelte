<script>
  import { accessKey } from '#lib/info.js';

  /** @type {'idle' | 'sending' | 'success' | 'error'} */
  let status = $state('idle');
  let message = $state('');

  /** @param {SubmitEvent & { currentTarget: HTMLFormElement }} event */
  const handleSubmit = async (event) => {
    event.preventDefault();
    // A button that is disabled while sending loses the keyboard focus, so the guard lives here
    if (status === 'sending') return;

    const form = event.currentTarget; // currentTarget is cleared after the first await
    status = 'sending';
    message = 'Sending your message…';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });

      const result = await response.json();

      if (result.success) {
        status = 'success';
        message = "Message sent successfully! We'll get back to you soon.";
        form.reset();
      } else {
        status = 'error';
        message = 'Something went wrong. Please try again later.';
      }
    } catch (err) {
      console.error('Submission error:', err);
      status = 'error';
      message = 'Network error. Please check your connection.';
    }
  };
</script>

<form onsubmit={handleSubmit} class="space-y-8 max-w-2xl mx-auto">
  <input type="hidden" name="access_key" value={accessKey} />

  <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">
    Fields marked with <span aria-hidden="true">*</span><span class="sr-only">an asterisk</span> are required.
  </p>

  <div class="grid md:grid-cols-2 gap-8">
    <div class="space-y-3">
      <label for="contact-name" class="block text-xs font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400 ml-1">
        Your Name <span class="text-blue-600 dark:text-blue-400" aria-hidden="true">*</span>
      </label>
      <input
        class="input-field"
        type="text"
        id="contact-name"
        name="name"
        autocomplete="name"
        placeholder="John Doe"
        required
      />
    </div>

    <div class="space-y-3">
      <label for="contact-email" class="block text-xs font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400 ml-1">
        Your Email <span class="text-blue-600 dark:text-blue-400" aria-hidden="true">*</span>
      </label>
      <input
        class="input-field"
        type="email"
        id="contact-email"
        name="email"
        autocomplete="email"
        placeholder="john@example.com"
        required
      />
    </div>
  </div>

  <div class="space-y-3">
    <label for="contact-subject" class="block text-xs font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400 ml-1">
      Subject <span class="text-blue-600 dark:text-blue-400" aria-hidden="true">*</span>
    </label>
    <!-- `subject` is the field Web3Forms uses as the subject line of the email it sends -->
    <input
      class="input-field"
      type="text"
      id="contact-subject"
      name="subject"
      placeholder="How can we help you?"
      required
    />
  </div>

  <div class="space-y-3">
    <label for="contact-message" class="block text-xs font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400 ml-1">
      Message <span class="text-blue-600 dark:text-blue-400" aria-hidden="true">*</span>
    </label>
    <textarea
      class="input-field min-h-[200px] resize-none"
      id="contact-message"
      name="message"
      placeholder="Please describe your inquiry in detail..."
      required
    ></textarea>
  </div>

  <button
    type="submit"
    class="btn-primary w-full py-5 text-sm uppercase tracking-[0.2em] {status === 'sending' ? 'opacity-70 cursor-wait' : ''}"
    aria-disabled={status === 'sending'}
  >
    {#if status === 'sending'}
      <span class="i-lucide-loader-2 w-5 h-5 animate-spin mr-3" aria-hidden="true"></span> Sending...
    {:else}
      Send Message
    {/if}
  </button>

  <!-- The live region exists from the start: screen readers only announce changes to a region that
       is already in the page, not one that is inserted together with its text. -->
  <div role="status" aria-live="polite" aria-atomic="true">
    {#if status === 'success' || status === 'error'}
      <div
        class="flex items-center gap-4 p-6 rounded-3xl text-sm font-bold uppercase tracking-wider animate-in fade-in zoom-in duration-500 {status === 'success'
          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
          : 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'}"
      >
        <span
          class={status === 'success' ? 'i-lucide-check-circle shrink-0' : 'i-lucide-alert-circle shrink-0'}
          aria-hidden="true"
        ></span>
        <span>{message}</span>
      </div>
    {:else if status === 'sending'}
      <span class="sr-only">{message}</span>
    {/if}
  </div>
</form>
