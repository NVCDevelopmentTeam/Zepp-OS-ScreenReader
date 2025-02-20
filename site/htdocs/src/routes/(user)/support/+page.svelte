<script>
  import { siteTitle, githubLink, accessKey, discordChat } from '$lib/info.js';
  import Dialog from '$lib/components/Dialog.svelte';
  import CollapsibleSection from '$lib/components/CollapsibleSection.svelte';

  let dialog = $state();
  let files = $state();
  let issue = 'https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader/issues';
  const pageTitle = 'Support';

  const openDialog = () => {
    dialog.showModal();
    dialog.focus();
  };
  const closeDialog = () => {
    dialog.close();
  };

  let status = $state("");
  let Agree = $state(false);

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
        console.log(result);
        status = result.message || "Success";
        closeDialog();
      } else {
        status = result.message || "Submission failed.";
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      status = "Error submitting form.";
    }
  };
</script>

<svelte:head>
  <title>{pageTitle} | {siteTitle}</title>
  <meta name="description" content="Find support for Zepp OS Screen Reader (ZSR), a screen reader developed for the visually impaired for smart wearable devices running Zepp OS." />
</svelte:head>

<div class="container">
  <h1>{pageTitle}</h1>
  <h2>About ZSR Project</h2>
  <p>The ZSR project, including discussions and all source code for this site and the Zepp OS screen reader, is hosted on <a href={githubLink}>GitHub</a>. If you have a problem with Zepp OS Screen Reader, please report your problem on our <a href={issue} aria-label="GitHub issue tracker for Zepp OS Screen Reader">GitHub issue tracker</a>.</p>
  <h2>Note</h2>
  <p>The product is provided free of charge to end users only. If any organization or individual wants to integrate the author's product into their service, they need the author's written consent.</p>

  <h2 id="TroubleshootingGuide">Troubleshooting Guide</h2>
  <p>If you encounter any problems while using Zepp OS Screen Reader (ZSR), you can refer to the following steps to find a quick and effective solution:</p>
  <ul>
    <li><strong>Restart your device:</strong> Turn your device off and on again.</li>
    <li><strong>Updating the application:</strong> Ensure you are using the latest version of ZSR.</li>
    <li><strong>Check settings:</strong> Verify that ZSR settings are appropriate for your needs.</li>
  </ul>

  <h2 id="contact">Contact Support</h2>
  <p>Contact us through:</p>
  <ul>
    <li><strong>Contact page:</strong> <a href="/contact">Contact page</a></li>
    <li><strong>Discord:</strong> <a href={discordChat}>Join our Discord community</a></li>
    <li><strong>Official Zepp OS Support:</strong> Visit <a href="https://www.zepp.com/support/zsr" aria-label="Official Zepp OS Screen Reader support page">Zepp OS Screen Reader support page</a>.</li>
  </ul>
  <p>Provide the following information:</p>
  <ul>
    <li><strong>Problem description:</strong> Include error messages, scenarios, and attach media if possible.</li>
    <li><strong>Device information:</strong> Provide the model and OS version of your device.</li>
  </ul>

  <h2 id="feedback">Send us feedback</h2>
  <p>If you have feedback about ZSR, please leave it <button role="link" onclick={() => dialog.showModal()}>here</button>.</p>

  <Dialog bind:dialog on:close={() => console.log('closed')}>
    <form onsubmit={handleSubmit}>
      <input type="hidden" name="access_key" value={accessKey} />
      <label class="required" for="send-feedback">Detailed description of the problem</label>
      <textarea class="field req" id="send-feedback" name="Send feedback" required rows="3"></textarea>
      <label class="required" for="email">Email</label>
      <input class="field req" type="email" id="email" name="email" required />
      <label for="add-file">Attach audio or video files</label>
      <input type="file" id="add-file" name="add file" accept="audio/*, video/*" bind:files />
      {#if files && files[0]}
        <p>{files[0].name}</p>
      {/if}
      <input type="checkbox" id="Agree" name="Agree" bind:checked={Agree} />
      <label for="Agree">By sending feedback, you agree to our <a href="/privacy-policy">Privacy policy</a>.</label>
      <input type="submit" disabled={!Agree} value="Send" />
    </form>
    <div>{status}</div>
  </Dialog>
</div>
