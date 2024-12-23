import { error, redirect } from '@sveltejs/kit';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_REPO_ID } from '$env/static/private';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    const code = url.searchParams.get('code');
    
    if (!code) {
        throw error(400, 'Authorization code is required');
    }

    const githubData = {
        code,
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        ...(GITHUB_REPO_ID ? { repository_id: GITHUB_REPO_ID } : {})
    };

    try {
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(githubData)
        });

        if (!response.ok) {
            throw new Error(`GitHub OAuth error: ${response.status}`);
        }

        const { access_token: token } = await response.json();
        
        if (!token) {
            throw new Error('No access token received from GitHub');
        }

        const content = {
            token,
            provider: 'github'
        };

        // Create HTML response with postMessage script
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Authorization Callback</title>
                </head>
                <body>
                    <script>
                        (function() {
                            function receiveMessage(event) {
                                window.opener.postMessage(
                                    'authorization:github:success:${JSON.stringify(content)}',
                                    event.origin
                                );
                                window.removeEventListener('message', receiveMessage);
                            }
                            
                            window.addEventListener('message', receiveMessage);
                            window.opener.postMessage('authorizing:github', '*');
                        })();
                    </script>
                </body>
            </html>
        `;

        return new Response(html, {
            headers: {
                'Content-Type': 'text/html',
                // Add security headers
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY'
            }
        });
    } catch (err) {
        console.error('GitHub OAuth error:', err);
        throw redirect(303, '/?error=auth_failed');
    }
}