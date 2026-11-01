import { redirect } from '@sveltejs/kit'
import { OAUTH_GITHUB_CLIENT_ID } from '$app/env/private'

export const prerender = false

export const GET = async ({ cookies }) => {
  if (!OAUTH_GITHUB_CLIENT_ID) return new Response('OAuth is not configured.', { status: 500 })

  // Random `state`: the callback only accepts the sign-in that started in this browser (CSRF protection)
  const state = crypto.randomUUID()
  cookies.set('oauth_state', state, { path: '/', maxAge: 600, httpOnly: true, sameSite: 'lax' })

  // Prepare the URLSearchParams with the necessary OAuth details
  const params = new URLSearchParams({
    client_id: OAUTH_GITHUB_CLIENT_ID,
    scope: 'repo,user',
    state
  })

  // Redirect to GitHub's OAuth authorization page
  redirect(302, `https://github.com/login/oauth/authorize?${params.toString()}`, { external: true })
}
