import { error, redirect } from '@sveltejs/kit';  
import { OAUTH_GITHUB_CLIENT_ID, OAUTH_GITHUB_CLIENT_SECRET, OAUTH_GITHUB_REPO_ID } from '$env/static/private';

export const prerender = false;

export async function GET({ url }) {
  const code = url.searchParams.get('code');
  console.log('Received code:', code); // Log code nhận từ URL

  if (!code) {
    throw error(400, 'Missing authorization code');
  }

  const data = new URLSearchParams({
    code,
    client_id: OAUTH_GITHUB_CLIENT_ID,
    client_secret: OAUTH_GITHUB_CLIENT_SECRET,
    ...(OAUTH_GITHUB_REPO_ID ? { repository_id: OAUTH_GITHUB_REPO_ID } : {}),
  });

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',  // Change to x-www-form-urlencoded
      },
      body: data.toString(),  // Use URLSearchParams to encode body correctly
    });

    console.log('GitHub response status:', response.status); // Log status code
    const body = await response.json();
    console.log('GitHub response body:', body); // Log body content

    if (!response.ok || !body.access_token) {
      throw new Error(`GitHub OAuth error: ${body.error_description || body.error || 'Unknown error'}`);
    }

    const content = {
      token: body.access_token,
      provider: 'github',
    };

    const script = `
      <script>
        const receiveMessage = (message) => {
          if (window.opener) {
            window.opener.postMessage(
              'authorization:${content.provider}:success:${JSON.stringify(content)}',
              message.origin
            );
            window.removeEventListener('message', receiveMessage, false);
          }
        };
        window.addEventListener('message', receiveMessage, false);

        if (window.opener) {
          window.opener.postMessage('authorizing:${content.provider}', '*');
        }
      </script>
    `;

    return new Response(script, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (err) {
    console.error('GitHub OAuth Error:', err); // Log lỗi khi có exception
    return redirect(302, '/?error=😡');
  }
}
