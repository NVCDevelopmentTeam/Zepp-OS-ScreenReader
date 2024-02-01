<script>
import { siteTitle } from '$lib/info.js';

let pageTitle = 'Support';
</script>

<svelte:head>
  <title>{pageTitle} | {siteTitle}</title>
  <meta name="description" content="Get assistance with Zepp OS Screen Reader (ZSR) for your smart wearable device." />
</svelte:head>

<div>
  <h1>{pageTitle}</h1>

  <section class="support-options">
    <h2>How can we help you?</h2>
    <ul>
      <li><a href="#faq">Frequently Asked Questions</a></li>
      <li><a href="#troubleshooting">Troubleshooting</a></li>
      <li><a href="#contact">Contact Support</a></li>
      <li><a href="#feedback">Provide Feedback</a></li>
    </ul>
  </section>

  <section id="faq">
    <h2>Frequently Asked Questions</h2>
    </section>

  <section id="troubleshooting">
    <h2>Troubleshooting</h2>
    </section>

  <section id="contact">
    <h2>Contact Support</h2>
    <p>If you need further assistance, please contact us through one of the following channels:</p>
    </section>

  <section id="feedback">
    <h2>Provide Feedback</h2>
    <p>Your feedback is valuable to us! Please share your thoughts on ZSR and help us improve the experience.</p>
    </section>
</div>
