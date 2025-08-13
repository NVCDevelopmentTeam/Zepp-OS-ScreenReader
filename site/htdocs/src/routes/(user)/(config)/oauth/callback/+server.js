import { redirect } from '@sveltejs/kit'
import { OAUTH_GITHUB_CLIENT_ID, OAUTH_GITHUB_CLIENT_SECRET } from '$env/static/private'

export const prerender = false

export const GET = async ({ url }) => {
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

    const content = {
      token: body.access_token,
      provider: 'github'
    }

    const script = `
      <script>
        const receiveMessage = (message) => {
          if (window.opener) {
            window.opener.postMessage(
              'authorization:${content.provider}:success:${JSON.stringify(content)}',
              message.origin
            );

            window.removeEventListener("message", receiveMessage, false);
          }
        }
        window.addEventListener("message", receiveMessage, false);

        if (window.opener) {
          window.opener.postMessage("authorizing:${content.provider}", "*");
        }
      </script>
    `

    return new Response(script, {
      headers: { 'Content-Type': 'text/html' }
    })
  } catch (err) {
    console.log(err)
    redirect(302, '/?error=😡')
  }
}
