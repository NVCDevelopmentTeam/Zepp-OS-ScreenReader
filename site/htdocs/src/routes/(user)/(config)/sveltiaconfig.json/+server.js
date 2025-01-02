import sveltia from '$lib/sveltiaCMS.js';
import { json } from '@sveltejs/kit';

export async function GET() {
  const config = {
    backend: {
      name: 'github',
      repo: 'NVCDevelopmentTeam/Zepp-OS-ScreenReader',
      branch: 'main',
      site_domain: 'localhost:5173',
      base_url: 'http://localhost:5173',
      auth_endpoint: '/oauth',
    },
    media_folder: '/site/htdocs/src/lib/images',
    public_folder: '/site/htdocs/src/lib/images',
    adminDisabled: false,
    adminRoute: '/admin',
    oauthDisabled: false,
    oauthLoginRoute: '/oauth',
    oauthCallbackRoute: '/oauth/callback',
    collections: [
      {
        name: 'posts',
        label: 'Posts',
        folder: 'site/htdocs/src/lib/posts',
        create: true,
        preview_path_date_field: 'date',
        slug: '{{slug}}',
        fields: [
          {
            label: 'Title',
            name: 'title',
            widget: 'string',
          },
          {
            label: 'Publish Date',
            name: 'date',
            widget: 'datetime',
          },
          {
            label: 'Body',
            name: 'body',
            widget: 'markdown',
          },
        ],
      },
    ],
  };

  return json(config);
}

export async function POST({ url }) {
  try {
    // Fetch OAuth login data
    const postRes = await fetch(`${url.origin}/oauth`);
    if (!postRes.ok) {
      throw new Error(`Failed to fetch OAuth login data: ${postRes.statusText}`);
    }
    const posts = await postRes.json();

    // Fetch OAuth callback data
    const totalRes = await fetch(`${url.origin}/oauth/callback`);
    if (!totalRes.ok) {
      throw new Error(`Failed to fetch OAuth callback data: ${totalRes.statusText}`);
    }
    const total = await totalRes.json();

    // Return the combined data as JSON
    return json({ posts, total });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
}
