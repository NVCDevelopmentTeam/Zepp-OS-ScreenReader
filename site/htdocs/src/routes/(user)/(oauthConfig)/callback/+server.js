import { OAUTH_GITHUB_CLIENT_ID, OAUTH_GITHUB_CLIENT_SECRET, OAUTH_GITHUB_REPO_ID } from '$env/static/private';
import { error, redirect } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    const code = url.searchParams.get('code');
    
    if (!code) {
        return new Response('Authorization code is required', { status: 400 });
    }

    const data = {
        code,
        client_id: OAUTH_GITHUB_CLIENT_ID,
        client_secret: OAUTH_GITHUB_CLIENT_SECRET,
        ...(OAUTH_GITHUB_REPO_ID ? { repository_id: OAUTH_GITHUB_REPO_ID } : {})
    };

    try {
        // Add DNS resolution timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw error(response.status, 'GitHub OAuth request failed');
        }

        const body = await response.json();
        const content = {
            token: body.access_token,
            provider: 'github'
        };

        // Create HTML response with the authentication script
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>OAuth Callback</title>
                </head>
                <body>
                    <script>
                        const receiveMessage = (message) => {
                            window.opener.postMessage(
                                'authorization:${content.provider}:success:${JSON.stringify(content)}',
                                message.origin
                            );
                            window.removeEventListener('message', receiveMessage, false);
                        }
                        window.addEventListener('message', receiveMessage, false);
                        window.opener.postMessage('authorizing:${content.provider}', '*');
                    </script>
                </body>
            </html>
        `;

        return new Response(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8'
            }
        });
    } catch (err) {
        console.error('OAuth error:', err);
        
        // Handle network errors more gracefully
        if (err.code === 'ENOTFOUND') {
            return new Response('Network connection error. Please check your internet connection.', {
                status: 503,
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        }

        // Use a plain text error message instead of emoji
        return new Response('Authentication failed. Please try again.', {
            status: 500,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }
}