<script>
  import { page } from "$app/stores";
  import logo from '$lib/images/logo.png';
  import { SignIn, SignOut } from "@auth/sveltekit/components";
</script>

<div class="min-h-screen flex flex-col">
  <!-- Header -->
  <header class="bg-gray-800 text-white">
    <div class="max-w-7xl mx-auto px-4 flex items-center justify-between py-4">
      <a href="/admin" class="flex items-center">
        <img src={logo} alt="ZSR logo" class="h-10 w-auto" />
        <span class="ml-3 text-xl font-semibold">Dashboard</span>
      </a>
      {#if $page.data.session}
        <div class="flex items-center space-x-4">
          {#if $page.data.session.user?.image}
            <span
              style="background-image: url('{$page.data.session.user.image}')"
              class="w-10 h-10 rounded-full bg-cover bg-center"
              aria-label="User Avatar"
            ></span>
          {/if}

          <div class="text-sm">
            <small>Signed in as</small>
            <br />
            <strong>{$page.data.session.user?.email ?? $page.data.session.user?.name}</strong>
          </div>

          <a
            href="/auth/signout"
            class="button bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            data-sveltekit-preload-data="off"
          >
            Sign out
          </a>
        </div>
      {/if}
    </div>
  </header>

  <!-- Main Content -->
  <main class="flex-1 container mx-auto p-4 bg-gray-50">
    <slot />
  </main>

  <!-- Footer -->
  <footer class="bg-gray-800 text-white py-6">
    <div class="max-w-7xl mx-auto px-4 flex justify-between">
      <a href="/" class="text-gray-300 hover:text-white">← Back to Zepp OS Screen Reader</a>
      <a href="/privacy-policy" class="text-gray-300 hover:text-white">Privacy Policy</a>
    </div>
  </footer>
</div>
