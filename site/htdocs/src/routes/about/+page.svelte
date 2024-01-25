<script>
  import { siteTitle, githubLink, zeppOSDocs, zeppOSScreen } from '$lib/info.js';
</script>

<svelte:head>
  <title>About | {siteTitle}</title>
  <meta name="description" content="AboutPage" />
</svelte:head>

<div class="container">
  <h1>About this app</h1>

  <p>
    ZSR (Zepp OS Screen Reader) is an app that provides accessibility features for users with visual impairments. It runs on devices that use the Zepp operating system, such as smartwatches and fitness trackers. ZSR can read out loud the text and icons on the screen, as well as notifications and alerts from other apps. ZSR also supports voice commands and gestures to control the device and the app.
  </p>

  <p>
    ZSR is developed by the NVC Development Team, a group of passionate developers who aim to make technology more inclusive and user-friendly. You can find the source code of ZSR on [GitHub](${githubLink}), where you can also report issues, request features, and contribute to the project.
  </p>

  <p>
    If you want to learn more about ZSR, you can visit the [Zepp OS Developer Documentation](${zeppOSDocs}). It provides guides, tutorials, and best practices for developing apps for Zepp OS devices. Additionally, you can check out the [Zepp OS Screen Adaptation](${zeppOSScreen}) article, which explains how to design and adapt your app for different screen shapes and sizes.
  </p>
</div>