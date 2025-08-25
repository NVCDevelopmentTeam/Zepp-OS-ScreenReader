<script>
  import { siteTitle } from '$lib/info.js';
  import Contact from '$lib/components/Contact.svelte';
</script>

<svelte:head>
  <title>Contact | {siteTitle}</title>
  <meta name="description" content="Contact me" />
</svelte:head>

<div class="max-w-2xl mx-auto p-4">
  <h1 class="text-3xl font-bold mb-4">Contact me</h1>
  <p class="mb-4">
    If you have any questions, feedback, or suggestions about ZSR, please feel free to contact me. You can fill out the form below, or send me an email at
    <a href="mailto:contact@zeppreader.com" class="text-blue-700 underline">contact@zeppreader.com</a>. I will try to reply as soon as possible. Thank you for using ZSR and supporting our project!
  </p>
  <hr class="my-4" />
  <h2 class="text-2xl font-semibold mb-2">Contact form</h2>
  <p class="mb-4">Please fill in your information in the form below<br>(Fields marked * are required)</p>
  <Contact />
</div>
