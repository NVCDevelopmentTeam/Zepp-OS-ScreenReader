<script>
  import { siteTitle } from '$lib/info.js';
  import CollapsibleSection from '$lib/components/CollapsibleSection.svelte';
  import FeedbackDialog from '$lib/components/FeedbackDialog.svelte';

  let dialog;
  let pageTitle = 'Support';
</script>

<svelte:head>
  <title>{pageTitle} | {siteTitle}</title>
  <meta name="description" content="Find support for Zepp OS Screen Reader (ZSR), a screen reader developed for the visually impaired for smart wearable devices running Zepp OS." />
</svelte:head>

<div class="container">
  <h1>{pageTitle}</h1>

  <h2>About ZSR Project</h2>
  <p>The ZSR project, including the discussions and source code of this website as well as the Zepp OS screen reader, is hosted on GitHub. If you encounter an issue with the Zepp OS Screen Reader, you can report it on our GitHub page.</p>

  <h2>Note</h2>
  <p>The product is provided free of charge to end users only. If any organization or individual wants to integrate the author's product into their service, they need the author's written consent. The author is not responsible for organizations or individuals distributing the author's products for other purposes.</p>

  <section class="support-options">
    <h2>How Can We Assist You?</h2>
    <ul>
      <li><a href="#faq">FAQs</a></li>
      <li><a href="#troubleshooting">Troubleshooting Guide</a></li>
      <li><a href="#contact">Reach Out to Support</a></li>
      <li><a href="#feedback">Give Us Your Feedback</a></li>
    </ul>
  </section>

  <section id="faq">
    <h2>Frequently Asked Questions</h2>
    <!-- Add your FAQs here -->
  </section>

  <section>
    <CollapsibleSection headerText={'Question 1?'}>
      <div class="content">
        Look at all this fun content
      </div>
    </CollapsibleSection>

    <CollapsibleSection headerText={'Question 2?'}>
      <div class="content">
        Look at all this fun content
      </div>
    </CollapsibleSection>
  </section>

  <section id="troubleshooting">
    <h2>Troubleshooting</h2>
    <!-- Add your troubleshooting guide here -->
  </section>

  <section id="contact">
    <h2>Contact Support</h2>
    <p>If you require further assistance, please reach out to us through the following channels:</p>
    <!-- Add your contact information here -->
  </section>

  <section id="feedback">
    <h2>We Value Your Feedback</h2>
    <p>Your feedback helps us improve ZSR. Please share your thoughts and experiences with us.</p>
    <!-- Add your feedback form or information here -->

    <button on:click={() => dialog.showModal()}>Open It!</button>

    <FeedbackDialog bind:dialog on:close={() => console.log('closed')}>
      This is amazingly simple! (press esc to close)
    </FeedbackDialog>
  </section>
</div>

<style>
  section {
    width: 300px;
  }

  .content {
    background-color: #f4f4f4;
    padding: 0.5em;
  }
</style>