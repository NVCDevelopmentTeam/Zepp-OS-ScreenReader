import { json, redirect } from '@sveltejs/kit';
import { OAUTH_GITHUB_CLIENT_ID, OAUTH_GITHUB_CLIENT_SECRET, OAUTH_GITHUB_REPO_ID } from '$env/static/private';

export const prerender = false;

export async function GET({ url }) {
  const code = url.searchParams.get('code');
  if (!code) {
    console.error('Authorization code not found');
    return redirect(303, '/?error=Authorization code not found');
  }

  const data = {
    code,
    client_id: OAUTH_GITHUB_CLIENT_ID,
    client_secret: OAUTH_GITHUB_CLIENT_SECRET,
    ...(OAUTH_GITHUB_REPO_ID ? { repository_id: OAUTH_GITHUB_REPO_ID } : {}),
  };

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return redirect(303, '/?error=HTTP error during token request');
    }

    const body = await response.json();
    const content = {
      token: body.access_token,
      provider: 'github',
    };

    const script = `
      <script>
        (function() {
          const provider = ${JSON.stringify(content.provider)};
          const token = ${JSON.stringify(content.token)};
          const message = 'authorization:' + provider + ':success:' + JSON.stringify({ token, provider });

          if (window.opener) {
            window.opener.postMessage(message, '*');
            window.close();
          } else {
            console.error('No window.opener found. Unable to communicate with parent window.');
          }
        })();
      </script>
    `;

    return new Response(script, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (err) {
    console.error('Error during OAuth process:', err);
    return redirect(303, '/?error=OAuth process failed');
  }
}
