<script>
import {siteTitle} from '$lib/info.js';
import Contact from '$lib/components/Contact.svelte';
</script>
<svelte:head>
	<title>Contact {siteTitle}</title>
	<meta name="description" content="Contact me" />
</svelte:head>

<div class="text-column">
<h1>Contact me</h1>
<p>
	If you have any questions, feedback, or suggestions about ZSR, please feel free to contact me. You can fill out the form below, or send me an email at contact@Zsr.net. I will try to reply as soon as possible. Thank you for using ZSR and supporting our project!
</p>
<h2>Contact form</h2>
<p>Please fill in your information in the form below (Fields marked * are required)</p>
<Contact />
</div>