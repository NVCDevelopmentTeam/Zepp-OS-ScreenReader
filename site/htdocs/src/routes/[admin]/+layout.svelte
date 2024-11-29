<script>
  import { page } from "$app/stores";
  import logo from '$lib/images/logo.png';
  import { SignIn, SignOut } from "@auth/sveltekit/components";

  // Ensure reactive destructuring for Svelte 5
  let { data } = page;

  // Debug: Log session data to verify if it is accessible
  $: console.log("Session Data:", data?.session);
</script>

<div class="min-h-screen flex flex-col">
  <!-- Header -->
  <header class="bg-gray-800 text-white">
    <div class="max-w-7xl mx-auto px-4 flex items-center justify-between py-4">
      <a href="/admin" class="flex items-center">
        <img src={logo} alt="ZSR logo" class="h-10 w-auto" />
        <span class="ml-3 text-xl font-semibold">Dashboard</span>
      </a>
      <div class="flex items-center space-x-4">
        <!-- User Avatar -->
        {#if data?.session?.user?.image}
          <img
            src={data.session.user.image}
            alt="User avatar"
            class="w-10 h-10 rounded-full bg-cover bg-center"
          />
        {:else}
          <img
            alt="Default avatar"
            src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${Math.floor(Math.random() * 100000) + 1}&randomizeIds=true`}
            class="w-10 h-10 rounded-full bg-cover bg-center"
          />
        {/if}

        <!-- Session Status -->
        {#if data?.session}
          <div class="text-sm">
            <small>Signed in as</small>
            <br />
            <strong>{data.session.user?.email ?? data.session.user?.name}</strong>
          </div>
          <SignOut>
            <button class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Sign out
            </button>
          </SignOut>
        {:else}
          <div>
            <p class="text-gray-300">You are not signed in</p>
            <SignIn>
              <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Sign in
              </button>
            </SignIn>
          </div>
        {/if}
      </div>
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
