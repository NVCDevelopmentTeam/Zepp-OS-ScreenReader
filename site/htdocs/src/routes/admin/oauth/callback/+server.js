import { OAUTH_GITHUB_CLIENT_ID, OAUTH_GITHUB_CLIENT_SECRET } from '$app/env/private'

export const prerender = false

/**
 * Page that hands the result to the CMS window (Decap/Sveltia popup protocol).
 * The message is posted only to this site's own origin, never to whichever window asks for it.
 * @param {string} origin
 * @param {string} provider
 * @param {'success' | 'error'} status
 * @param {object} content
 */
function respond(origin, provider, status, content) {
  const message = `authorization:${provider}:${status}:${JSON.stringify(content)}`
  // JSON.stringify output must not be able to close the <script> element
  const literal = (/** @type {string} */ value) => JSON.stringify(value).replace(/</g, '\\u003c')

  const script = `
      <script>
        const origin = ${literal(origin)};
        const receiveMessage = (event) => {
          if (event.origin !== origin) return;
          event.source.postMessage(${literal(message)}, origin);
          window.removeEventListener("message", receiveMessage, false);
        }
        window.addEventListener("message", receiveMessage, false);

        if (window.opener) {
          window.opener.postMessage("authorizing:${provider}", origin);
        }
      </script>
    `

  return new Response(script, {
    status: status === 'success' ? 200 : 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
  })
}

export const GET = async ({ url, cookies }) => {
  const provider = 'github'

  // Reject sign-ins that did not start from /admin/oauth in this browser
  const state = url.searchParams.get('state')
  if (!state || state !== cookies.get('oauth_state')) {
    return respond(url.origin, provider, 'error', { message: 'Invalid sign-in state' })
  }
  cookies.delete('oauth_state', { path: '/' })

  const data = {
    code: url.searchParams.get('code'),
    client_id: OAUTH_GITHUB_CLIENT_ID,
    client_secret: OAUTH_GITHUB_CLIENT_SECRET
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const body = await response.json()
    // GitHub answers 200 with an `error` field when the code is invalid or expired
    if (!body.access_token) {
      throw new Error(body.error_description || 'No access token returned')
    }

    return respond(url.origin, provider, 'success', { token: body.access_token, provider })
  } catch (err) {
    console.error(err)
    return respond(url.origin, provider, 'error', { message: 'Sign-in failed' })
  }
}
