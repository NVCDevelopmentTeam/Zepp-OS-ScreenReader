// Cloudflare Pages Function for GET /admin/oauth: starts the GitHub sign-in of the Sveltia CMS.
// The site itself is static; only the two OAuth endpoints run as Functions.
// Set OAUTH_GITHUB_CLIENT_ID and OAUTH_GITHUB_CLIENT_SECRET in the Pages project settings
// (Settings > Variables and Secrets), never in the repository.

/** @param {{ env: Record<string, string | undefined> }} context */
export async function onRequestGet({ env }) {
  const clientId = env.OAUTH_GITHUB_CLIENT_ID
  if (!clientId) return new Response('OAuth is not configured.', { status: 500 })

  // Random `state`: the callback only accepts the sign-in that started in this browser (CSRF protection)
  const state = crypto.randomUUID()
  const params = new URLSearchParams({ client_id: clientId, scope: 'repo,user', state })

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params.toString()}`,
      'Set-Cookie': `oauth_state=${state}; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
      'Cache-Control': 'no-store'
    }
  })
}
