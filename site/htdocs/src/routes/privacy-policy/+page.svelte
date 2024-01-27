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
    Welcome to the official privacy policy of the Zepp OS Screen Reader (ZSR) website. This policy outlines our practices for data collection and usage when you access our website.
  </p>
  <p>
    The NVC Development Team values your privacy and is dedicated to safeguarding your personal data.
  </p>
  <h2>Data Collection</h2>
  <p>
    We may gather specific information during your visit to our website, including but not limited to:
  </p>
  <ul>
    <li>Device specifics such as the model, operating system version, and unique identifiers.</li>
    <li>Usage details such as the features you access, the settings you modify, and the actions you perform within the website.</li>
    <li>Information about your interactions with ads served by Google AdSense.</li>
    <li>Information collected through cookies, as outlined in our Cookie Policy.</li>
  </ul>
  <h2>Usage of Your Data</h2>
  <p>
    We utilize the data collected from you to:
  </p>
  <ul>
    <li>Enhance the website and its functionalities.</li>
    <li>Analyze website usage patterns and trends to improve user experience.</li>
    <li>Address your inquiries, requests, or feedback.</li>
    <li>Maintain the security and integrity of our systems.</li>
    <li>Fulfill legal obligations.</li>
    <li>Comply with our Data Processing Agreement and Developer Agreement.</li>
  </ul>
  <h2>Data Disclosure</h2>
  <p>
    We may disclose your data under the following circumstances:
  </p>
  <ul>
    <li>To trusted third-party service providers who assist us in managing our website and delivering services to you.</li>
    <li>If we deem disclosure necessary to protect our rights, property, or safety, or those of others.</li>
    <li>To comply with relevant laws, regulations, or legal processes.</li>
  </ul>
  <h2>Security Measures</h2>
  <p>
    We implement reasonable measures to protect your data from unauthorized access, disclosure, alteration, or destruction. However, please note that no transmission or storage method is entirely secure, and we cannot assure absolute security.
  </p>
  <h2>Privacy Policy Updates</h2>
  <p>
    We may revise this privacy policy periodically. Any changes will be posted on this page, and the updated policy will become effective upon posting.
  </p>
  <p>
    We have established an access policy for users visiting our website to ensure safety and security, enabling visitors to have full control over their personal data. We also provide an access policy for users with special needs.
  </p>
  <h2>Legal Basis, Website Terms, and Policies</h2>
  <p>
    By accessing the ZSR website, you consent to the following:
  </p>
  <ul>
    <li>Our End User License Agreement.</li>
    <li>Our Terms of Service.</li>
  </ul>
  <p>
    For further information about our privacy practices, please reach out to us at contact.ZSR.net.
  </p>
</div>