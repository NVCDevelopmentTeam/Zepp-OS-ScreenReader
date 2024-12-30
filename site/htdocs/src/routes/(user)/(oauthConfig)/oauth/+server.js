import { GITHUB_CLIENT_ID } from '$env/static/private';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, cookies }) {
    // Generate and store a state parameter for security
    const state = crypto.randomUUID();

    // Set the cookie for state verification
    cookies.set('oauth_state', state, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 600 // 10 minutes
    });

    // Configure OAuth parameters
    const params = new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        scope: 'repo,user',
        state,
        // Ensure this matches your GitHub OAuth App configuration
        redirect_uri: `${url.origin}/callback`
    });

    // Redirect to GitHub's OAuth authorization page
    throw redirect(303, `https://github.com/login/oauth/authorize?${params}`);
}
