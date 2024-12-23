import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, cookies }) {
    // Retrieve the 'code' and 'state' parameters from the query string
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    // Retrieve the stored state from cookies
    const storedState = cookies.get('oauth_state');

    // Validate the state parameter to prevent CSRF attacks
    if (state !== storedState) {
        return new Response('Invalid state parameter', { status: 400 });
    }

    // Exchange the authorization code for an access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: `${url.origin}/oauth/callback`,
            state
        })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
        return new Response(`Error retrieving access token: ${tokenData.error_description}`, { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // Use the access token to fetch the user's GitHub profile
    const userResponse = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    const userData = await userResponse.json();

    if (userData.error) {
        return new Response(`Error retrieving user data: ${userData.message}`, { status: 400 });
    }

    // Here, you would typically create a session for the user
    // For example, set a cookie with a session ID or JWT
    // cookies.set('session_id', generatedSessionId, {
    //     path: '/',
    //     secure: process.env.NODE_ENV === 'production',
    //     httpOnly: true,
    //     sameSite: 'lax',
    //     maxAge: 86400 // 1 day
    // });

    // Redirect the user to the desired page after successful authentication
    throw redirect(303, '/dashboard');
}
