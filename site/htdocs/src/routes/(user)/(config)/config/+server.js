import sveltia from '$lib/sveltiaCMS.js';
import { json } from '@sveltejs/kit';

// POST request to fetch OAuth login and callback data
export async function POST({ url }) {
  // Fetch OAuth login data
  const postRes = await fetch(`${url.origin}/oauth`);
  const posts = await postRes.json();

  // Fetch OAuth callback data
  const totalRes = await fetch(`${url.origin}/oauth/callback`);
  const total = await totalRes.json();

  // Return the combined data as JSON
  return json({ posts, total });
}