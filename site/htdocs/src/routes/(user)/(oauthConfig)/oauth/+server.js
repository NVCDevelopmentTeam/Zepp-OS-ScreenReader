import { redirect } from '@sveltejs/kit';
import { OAUTH_GITHUB_CLIENT_ID } from '$env/static/private';

export const prerender = false;

export const GET = () => {
  const params = new URLSearchParams({
    client_id: OAUTH_GITHUB_CLIENT_ID,
    scope: 'repo,user',
  });

  throw redirect(302, `https://github.com/login/oauth/authorize?${params.toString()}`);
};
