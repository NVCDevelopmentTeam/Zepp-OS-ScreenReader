<script>
  import { onMount } from 'svelte';
  import { siteTitle } from '$lib/info.js';

  let pageTitle = 'Privacy Policy';

  onMount(() => {
    document.title = `${pageTitle} | ${siteTitle}`;
  });
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content="Privacy Policy" />
</svelte:head>

<div class="text-column">
  <h1>{pageTitle}</h1>

  <p>
    Welcome to the privacy policy page of Zepp OS Screen Reader (ZSR), a screen reader application running on Zepp OS for smart wearable devices.
  </p>

  <p>
    At NVC development Team, we take your privacy seriously and are committed to protecting your personal information. This privacy policy explains how we collect, use, and disclose your information when you use ZSR.
  </p>

  <h2>Information We Collect</h2>

  <p>
    When you use ZSR, we may collect certain information, including but not limited to:
  </p>

  <ul>
    <li>Device information, such as device model, operating system version, and unique device identifiers.</li>
    <li>Usage information, such as the features you use, the settings you configure, and the actions you take within the app.</li>
    <li>Log data, which may include your IP address, browser type, and pages visited.</li>
  </ul>

  <h2>How We Use Your Information</h2>

  <p>
    We use the information collected from you to:
  </p>

  <ul>
    <li>Provide and improve the ZSR app and its features.</li>
    <li>Analyze app usage and trends to enhance user experience.</li>
    <li>Respond to your inquiries, requests, or feedback.</li>
    <li>Ensure the security and integrity of our systems.</li>
    <li>Comply with legal obligations.</li>
    <li>Participate in the Google AdSense program and provide targeted advertising based on your interests. For more information about how Google uses your information, please see the <a href="https://policies.google.com/technologies/partner-sites">Google Privacy Policy.</a></li>
  </ul>

  <h2>Disclosure of Your Information</h2>

  <p>
    We may disclose your information in the following circumstances:
  </p>

  <ul>
    <li>To trusted third-party service providers who assist us in operating our app and providing services to you.</li>
    <li>If we believe disclosure is necessary to protect our rights, property, or safety, or the rights, property, or safety of others.</li>
    <li>To comply with applicable laws, regulations, or legal processes.</li>
  </ul>

  <h2>Security</h2>

  <p>
    We take reasonable measures to protect your information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.
  </p>

  <h2>Changes to This Privacy Policy</h2>

  <p>
    We may update this privacy policy from time to time. Any changes will be posted on this page, and the revised policy will be effective when posted.
  </p>

  <h2>Legal Basis, Website Terms and Policies</h2>

  <p>
    By using ZSR, you agree to the following:
  </p>

  <ul>
    <li><a href="/terms-of-service">Terms of Service</a></li>
    <li><a href="/cookie-policy">Cookie Policy</a></li>
    <li><a href="/data-processing-agreement">Data Processing Agreement</a></li>
    <li><a href="/end-user-license-agreement">End User License Agreement</a></li>
    <li><a href="/developer-agreement">Developer Agreement</a></li>
    <li><a href="/accessibility-statement">Accessibility Statement</a></li>
  </ul>

  <p>
    For more information about our privacy practices, please contact us at contact.ZSR.net.
  </p>
</div>