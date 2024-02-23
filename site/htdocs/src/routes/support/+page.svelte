<script>
  import { siteTitle, githubLink } from '$lib/info.js';
  import Dialog from '$lib/components/Dialog.svelte';
  import CollapsibleSection from '$lib/components/CollapsibleSection.svelte';

  let dialog;
  let files;
  let issue = 'https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader/issues';
  const pageTitle = 'Support';

  let status = "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    status = 'Submitting...';

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
    }
  };
let Agree = false;
</script>

<svelte:head>
  <title>{pageTitle} | {siteTitle}</title>
  <meta name="description" content="Find support for Zepp OS Screen Reader (ZSR), a screen reader developed for the visually impaired for smart wearable devices running Zepp OS." />
</svelte:head>

<div class="container">
  <h1>{pageTitle}</h1>
  <h2>About ZSR Project</h2>
  <p>The ZSR project, including discussions and all source code for this site and the Zepp OS screen reader, is hosted on <a href={githubLink}>GitHub.</a> If you have a problem with Zepp OS Screen Reader, please report your problem <a href={issue}>Here</a>.</p>
  <h2>Note</h2>
  <p>The product is provided free of charge to end users only. If any organization or individual wants to integrate the author's product into their service, they need the author's written consent. The author is not responsible for organizations or individuals distributing the author's products for other purposes.</p>

  <section class="support-options">
    <h2>How Can We Assist You?</h2>
    <ul>
<a href="#frequently asked questions">frequently asked questions</a>
<a href="#feedback">Send us feedback</a>
    </ul>
  </section>
<h2 id="frequently asked questions">frequently asked questions</h2>
      <CollapsibleSection headerText={'What is ZSR?'}>
        <div class="content">
          Zepp OS Screen reader (ZSR) is a feature that supports users who are visually impaired or have difficulty reading the screen on Zepp OS smartwatches. ZSR uses speech synthesis technology to read the content displayed on the screen, helping users easily access and use the watch.
        </div>
      </CollapsibleSection>

      <CollapsibleSection headerText={'How to enable ZSR?'}>
        <ol>
          <li>Open the Settings app on your watch.</li>
          <li>Select Accessibility.</li>
          <li>Select Screen Reader.</li>
          <li>Turn on the Screen Reader switch.</li>
        </ol>
      </CollapsibleSection>

      <CollapsibleSection headerText={'How to use ZSR?'}>
        <ul>
          <li>Swipe up or down to move through items.</li>
          <li>Double-tap to select an item.</li>
          <li>Swipe left or right to switch between screens.</li>
          <li>Press and hold to activate the voice assistant.</li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection headerText={'What contents can ZSR read?'}>
        <p>ZSR can read most of the content displayed on the watch screen, including:</p>
        <ul>
          <li>Time</li>
          <li>Date</li>
          <li>Battery status</li>
          <li>Notification</li>
          <li>Application name</li>
          <li>Message content</li>
          <li>etc.</li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection headerText={'What languages does ZSR support?'}>
        <p>ZSR currently supports the following languages:</p>
        <ul>
          <li>English</li>
          <li>Chinese</li>
          <li>Japanese</li>
          <li>Korean</li>
          <li>German</li>
          <li>French</li>
          <li>Spanish</li>
          <li>Portuguese</li>
          <li>Russian</li>
          <li>Italian</li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection headerText={'Where can I learn more about ZSR?'}>
        <p>You can learn more about ZSR at Zepp's support site <a href="https://www.zepp.com/support/zsr">here</a></p>
      </CollapsibleSection>

      <CollapsibleSection headerText={'Other FAQ'}>
        <ul>
          <li>
            <h3>Does ZSR consume a lot of battery?</h3>
            <p>Yes, ZSR will drain battery more than when not in use.</p>
          </li>
          <li>
            <h3>Can ZSR be used with Bluetooth headphones?</h3>
            <p>Yes, ZSR can be used with Bluetooth headphones</p>
          </li>
          <li>
            <h3>Can ZSR be used with third-party applications?</h3>
            <p>Currently, ZSR can only read content in system applications.</p>
          </li>
          <li>
            <h3>What problems might I encounter when using ZSR?</h3>
            <p>Some problems you may encounter when using ZSR include:</p>
            <ul>
              <li>ZSR may not read some content correctly.</li>
              <li>ZSR may have difficulty reading content in third-party applications.</li>
              <li>ZSR may drain battery faster.</li>
            </ul>
            <p>If you encounter any problems using ZSR, you can refer to the following resources:</p>
            <ul>
              <li><a href="https://www.zepp.com/support/zsr-faq">ZSR FAQ</a></li>
              <li><a href="https://www.zepp.com/support/zsr-user-guide">ZSR User Guide</a></li>
            </ul>
          </li>
          <li>
            <h3>Can I change ZSR's voice?</h3>
            <p>Yes, you can change ZSR's voice in Screen Reader settings.</p>
          </li>
          <li>
            <h3>Can I report a bug about ZSR?</h3>
            <p>Yes, you can report bugs about ZSR using the Zepp app on your smartphone.</p>
          </li>
        </ul>
      </CollapsibleSection>

      <section>
        <h2>Additional Resources</h2>
        <ul>
          <li><a href="https://www.zepp.com/support/zsr-faq">ZSR FAQ</a></li>
          <li><a href="https://www.zepp.com/support/zsr-user-guide">ZSR User Guide</a></li>
        </ul>
      </section>
<h2 id="feedback">Send us feedback</h2>
  <button role="link" on:click={() => dialog.showModal()}>Send feedback</button>

  <Dialog bind:dialog on:close={() => console.log('closed')}>
    <form on:submit="{handleSubmit}">
      <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE">
      <label class="required" for="send-feedback">Detailed description of the problem</label>
      <textarea class="field req" id="send-feedback" name="Send feedback" required rows="3"></textarea>
      <label class="required" for="email">Email</label>
      <input class="field req" type="email" id="email" name="email" required />
      <label for="add-file">Attach audio or video files</label>
      <input type="file" id="add-file" name="add file" accept="audio/*, video/*" bind:files />

      {#if files && files[0]}
        <p>{files[0].name}</p>
      {/if}

<input type="checkbox" id="Agree" name ="Agree" bind:checked={Agree} />
        <label for="Agree">By sending us feedback, you agree to this website's <a href="/privacy-policy">Privacy policy</a> and assume all legal responsibility when problems occur.</label>
      <input type="submit" value="Send" />
    </form>

    <div>{status}</div>
  </Dialog>
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
