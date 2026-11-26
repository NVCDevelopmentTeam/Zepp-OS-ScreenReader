// hooks.server.js
import { dev } from '$app/env'

/**
 * Content-Security-Policy. Keep it in sync with the policies in `_headers`, which cover the
 * prerendered pages (those are served straight from the Cloudflare assets and never run this hook).
 * @param {boolean} isAdmin
 */
function contentSecurityPolicy(isAdmin) {
  const directives = isAdmin
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
        // The Vite dev server needs a WebSocket for hot reloading; production does not
        `connect-src 'self' https://cloudflareinsights.com https://api.web3forms.com${dev ? ' ws: wss:' : ''}`,
        "worker-src 'self' blob:",
        "manifest-src 'self' blob:",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self' https://api.web3forms.com",
        "frame-ancestors 'none'"
      ]

  return directives.join('; ')
}

/** @type {import('@sveltejs/kit/hooks').Handle} */
export async function handle({ event, resolve }) {
  const response = await resolve(event)

  const url = new URL(event.request.url)
  const headers = new Headers(response.headers)
  const isAdmin = url.pathname.startsWith('/admin')

  if (isAdmin) {
    // The CMS and the OAuth callback (which carries the access token) must never be cached
    headers.set('Cache-Control', 'no-store')
    headers.delete('CDN-Cache-Control')
    headers.delete('Cloudflare-CDN-Cache-Control')
  } else if (url.pathname.startsWith('/_app/immutable/')) {
    // Vite hashed chunks: safe to cache for a year
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    headers.set('CDN-Cache-Control', 'public, max-age=31536000, immutable')
    headers.set('Cloudflare-CDN-Cache-Control', 'public, max-age=31536000, immutable')
  } else if (
    url.pathname.startsWith('/_app/') ||
    /\.(png|jpg|jpeg|gif|svg|webp|ico|avif|woff2?)$/.test(url.pathname)
  ) {
    // Non-hashed static files (favicon, fonts, images)
    headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
    headers.set('CDN-Cache-Control', 'public, max-age=604800')
  } else if (response.headers.get('content-type')?.includes('text/html')) {
    if (response.ok) {
      // HTML (SSR pages): short browser cache, long CDN cache. Same policy as the prerendered
      // pages in /_headers
      headers.set('Cache-Control', 'public, max-age=300, s-maxage=86400')
      headers.set('CDN-Cache-Control', 'public, s-maxage=86400')
      headers.set('Cloudflare-CDN-Cache-Control', 'public, s-maxage=86400')
    } else {
      // Never let a 404 or a 500 stay in the edge cache for a day
      headers.set('Cache-Control', 'no-store')
      headers.delete('CDN-Cache-Control')
      headers.delete('Cloudflare-CDN-Cache-Control')
    }
  } else if (url.pathname.startsWith('/api/')) {
    // API: never cache
    headers.set('Cache-Control', 'no-store')
  }

  // Security headers
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()')
  headers.set('Content-Security-Policy', contentSecurityPolicy(isAdmin))

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}
