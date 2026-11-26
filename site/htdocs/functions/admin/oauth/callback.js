// Cloudflare Pages Function for GET /admin/oauth/callback: finishes the GitHub sign-in and hands the
// token to the CMS window (Decap/Sveltia popup protocol).

/**
 * The message is posted only to this site's own origin, never to whichever window asks for it.
 * @param {string} origin
 * @param {'success' | 'error'} status
 * @param {object} content
 * @param {Record<string, string>} [extraHeaders]
 */
function respond(origin, status, content, extraHeaders = {}) {
  const provider = 'github'
  const message = `authorization:${provider}:${status}:${JSON.stringify(content)}`
  // JSON.stringify output must not be able to close the <script> element
  const literal = (/** @type {string} */ value) => JSON.stringify(value).replace(/</g, '\\u003c')

  const script = `<!doctype html><meta charset="utf-8"><title>Signing in…</title>
<script>
  const origin = ${literal(origin)};
  const receiveMessage = (event) => {
    if (event.origin !== origin) return;
    event.source.postMessage(${literal(message)}, origin);
    window.removeEventListener("message", receiveMessage, false);
  };
  window.addEventListener("message", receiveMessage, false);

  if (window.opener) {
    window.opener.postMessage("authorizing:${provider}", origin);
  }
</script>`

  return new Response(script, {
    status: status === 'success' ? 200 : 400,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'",
      ...extraHeaders
    }
  })
}

/** @param {{ request: Request, env: Record<string, string | undefined> }} context */
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const clearState = {
    'Set-Cookie': 'oauth_state=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax'
  }

  // Reject sign-ins that did not start from /admin/oauth in this browser
  const state = url.searchParams.get('state')
  const saved = /(?:^|;\s*)oauth_state=([^;]+)/.exec(request.headers.get('Cookie') ?? '')?.[1]
  if (!state || state !== saved) {
    return respond(url.origin, 'error', { message: 'Invalid sign-in state' }, clearState)
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: url.searchParams.get('code'),
        client_id: env.OAUTH_GITHUB_CLIENT_ID,
        client_secret: env.OAUTH_GITHUB_CLIENT_SECRET
      })
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const body = /** @type {any} */ (await response.json())
    // GitHub answers 200 with an `error` field when the code is invalid or expired
    if (!body.access_token) throw new Error(body.error_description || 'No access token returned')

    return respond(
      url.origin,
      'success',
      { token: body.access_token, provider: 'github' },
      clearState
    )
  } catch (err) {
    console.error(err)
    return respond(url.origin, 'error', { message: 'Sign-in failed' }, clearState)
  }
}
