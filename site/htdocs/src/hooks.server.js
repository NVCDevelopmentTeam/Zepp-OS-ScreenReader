// hooks.server.js

/** @type {import('@sveltejs/kit/hooks').Handle} */
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
  const isAdmin = url.pathname.startsWith('/admin')

  // The CMS and the OAuth callback (which carries the access token) must never be cached
  if (isAdmin) {
    headers.set('Cache-Control', 'no-store')
    headers.delete('CDN-Cache-Control')
    headers.delete('Cloudflare-CDN-Cache-Control')
  } else if (url.pathname.startsWith('/_app/immutable/')) // Vite hashed chunks
  {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    headers.set('CDN-Cache-Control', 'public, max-age=31536000, immutable')
    headers.set('Cloudflare-CDN-Cache-Control', 'public, max-age=31536000, immutable')
  } else // ================================
  // 2. NON-HASHED STATIC FILES (favicon, fonts, images in /static)
  // ================================
  if (
    url.pathname.startsWith('/_app/') ||
    /\.(png|jpg|jpeg|gif|svg|webp|ico|avif|woff2?)$/.test(url.pathname)
  ) {
    headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
    headers.set('CDN-Cache-Control', 'public, max-age=604800')
  } else // ================================
  // 3. HTML (SSR pages) — short browser cache, long CDN cache
  // ================================
  if (response.headers.get('content-type')?.includes('text/html')) {
    // same policy as the prerendered pages in /_headers
    headers.set('Cache-Control', 'public, max-age=300, s-maxage=86400')
    headers.set('CDN-Cache-Control', 'public, s-maxage=86400')
    headers.set('Cloudflare-CDN-Cache-Control', 'public, s-maxage=86400')
  } else // ================================
  // 4. API — never cache
  // ================================
  if (url.pathname.startsWith('/api/')) {
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
    (isAdmin
      ? [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https: blob:",
          "font-src 'self' data:",
          "connect-src 'self' https://cloudflareinsights.com data: blob: https://api.github.com https://github.com https://*.githubusercontent.com https://www.githubstatus.com",
          "worker-src 'self' blob:",
          "manifest-src 'self' blob:",
          "object-src 'none'",
          "base-uri 'self'",
          "frame-ancestors 'none'"
        ]
      : [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https: blob:",
          "font-src 'self' data:",
          "connect-src 'self' https://cloudflareinsights.com https://api.web3forms.com ws: wss:",
          "worker-src 'self' blob:",
          "manifest-src 'self' blob:",
          "frame-src 'none'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self' https://api.web3forms.com",
          "frame-ancestors 'none'"
        ]
    ).join('; ')
  )

  return new Response(response.body, {
    status: response.status,
    headers
  })
}
