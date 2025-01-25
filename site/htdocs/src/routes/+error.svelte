<script module>
  export async function load({ error }) {
    error(404, 'Not Found');
  }
</script>

<svelte:head>
  <title>404 - Page Not Found</title>
  <meta name="description" content="The page you are looking for does not exist." />
</svelte:head>

<main class="min-h-screen flex flex-col items-center justify-center bg-white text-center p-6">
  <h1 class="text-6xl font-extrabold text-gray-900 mb-4">404</h1>
  <h2 class="text-2xl font-semibold text-gray-700 mb-8">Oops! Page not found.</h2>
  <p class="text-lg text-gray-600 mb-6">
    The page you're looking for doesn't exist or has been moved.
  </p>
  <nav aria-label="Primary" class="space-x-4">
    <a href="/" class="text-blue-600 hover:underline">Home</a>
    <a href="/about" class="text-blue-600 hover:underline">About</a>
    <a href="/contact" class="text-blue-600 hover:underline">Contact</a>
  </nav>
</main>
