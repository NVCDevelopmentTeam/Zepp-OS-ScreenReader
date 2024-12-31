import { error, redirect } from '@sveltejs/kit';
import { OAUTH_GITHUB_CLIENT_ID, OAUTH_GITHUB_CLIENT_SECRET, OAUTH_GITHUB_REPO_ID } from '$env/static/private';

export const prerender = false;

export async function GET({ url }) {
  const code = url.searchParams.get('code');

  if (!code) {
    throw error(400, 'Missing authorization code');
  }

  const data = {
    code,
    client_id: OAUTH_GITHUB_CLIENT_ID,
    client_secret: OAUTH_GITHUB_CLIENT_SECRET,
    ...(OAUTH_GITHUB_REPO_ID ? { repository_id: OAUTH_GITHUB_REPO_ID } : {}),
  };

  try {
    // Gửi request POST với Content-Type là 'application/json'
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const body = await response.json();

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
    console.error(err);
    // Nếu có lỗi, redirect về trang chủ và truyền thông tin lỗi
    return redirect(302, '/?error=😡');
  }
}
