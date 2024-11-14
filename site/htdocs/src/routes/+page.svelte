<script>
  import PostsList from '$lib/components/PostsList.svelte';
  import { siteTitle, siteDescription, features } from '$lib/info.js';
  /** @type {import('./$types').PageData} */
  export let data;
</script>

<svelte:head>
  <title>Home | {siteTitle}</title>
  <meta name="description" content={siteDescription} />
</svelte:head>

<div class="flex flex-col flex-grow gap-8 pb-16">
  <h1>{siteTitle}</h1>
  <p>
    ZSR (Zepp OS Screen reader) is a screen reader software (accessibility service) for the blind and low vision that integrates into devices Amazfit smart wearable runs Zepp OS operating system. This is open source software developed by NVCDevelopmentTeam to help blind people use Amazfit devices easily without looking at the screen. ZSR is free open source software, so anyone can customize to their liking and contribute to ZSR's source code.
  </p>
<h2>The Issue</h2>
  <p>
Nowadays, with the help of technology, blind people can use devices such as computers, smartphones, and other devices. However, with smart wearable devices, that is a far-fetched thing because smart wearable devices that support screen readers such as devices running Wear OS (Talkback) or Watch OS (VoiceOver) are devices that High-end and very expensive wearable equipment, so blind people do not have enough conditions to equip themselves. On the contrary, low-cost devices do not support screen readers, so blind people have difficulty using them. Therefore, ZSR (Zepp OS Screen reader) was born to solve the above problem.
  </p>
<h2>Device requirements</h2>
  <p>
Support device running ZEP OS version 2.0 or higher. To install the app, please visit Amazfit app store to install the app.
  </p>
  <section class="w-full">
    <div class="flex items-center justify-between gap-4 mb-8">
      <h2 class="text-sm font-medium sm:text-base text-zinc-500 dark:text-zinc-400">
Recent posts
      </h2>
    </div>
  <div class="mt-8">
    <PostsList posts={data.posts} />
<hr/>
  </div>
  </section>
  <h2>Features:</h2>
  <ul>
    <!-- Uses an each block to iterate through the features array -->
    {#each features as feature}
      <li>{feature}</li>
    {/each}
  </ul>
</div>