// hooks.server.js

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const response = await resolve(event, {
    // Inject UnoCSS-friendly class attributes without transform overhead
    transformPageChunk: ({ html }) => html
  })

  const url = new URL(event.request.url)
  const headers = new Headers(response.headers)

  // ================================
  // 1. STATIC ASSETS (hashed by Vite — safe to cache 1 year)
  // ================================
  if (
    url.pathname.startsWith('/_app/immutable/') // Vite hashed chunks
  ) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    headers.set('CDN-Cache-Control', 'public, max-age=31536000, immutable')
    headers.set('Cloudflare-CDN-Cache-Control', 'public, max-age=31536000, immutable')
  }
  // ================================
  // 2. NON-HASHED STATIC FILES (favicon, fonts, images in /static)
  // ================================
  else if (
    url.pathname.startsWith('/_app/') ||
    /\.(png|jpg|jpeg|gif|svg|webp|ico|avif|woff2?)$/.test(url.pathname)
  ) {
    headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
    headers.set('CDN-Cache-Control', 'public, max-age=604800')
  }
  // ================================
  // 3. HTML (SSR pages) — short browser cache, long CDN + SWR
  // ================================
  else if (response.headers.get('content-type')?.includes('text/html')) {
    headers.set('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')
    headers.set('CDN-Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    headers.set(
      'Cloudflare-CDN-Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400'
    )
  }
  // ================================
  // 4. API — never cache
  // ================================
  else if (url.pathname.startsWith('/api/')) {
    headers.set('Cache-Control', 'no-store')
  }

  // ================================
  // 5. Security Headers (Lighthouse-friendly)
  // ================================
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()')

  // Strict CSP — adjust src domains as needed
  headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net",
      'frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com',
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ')
  )

  return new Response(response.body, {
    status: response.status,
    headers
  })
}
