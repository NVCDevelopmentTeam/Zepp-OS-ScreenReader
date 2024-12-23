import { json } from '@sveltejs/kit';

export async function GET() {
  const config = {
    backend: {
      name: 'github',
      repo: 'NVCDevelopmentTeam/Zepp-OS-ScreenReader', // GitHub repository name
      branch: 'main', // Branch to be used
      site_domain: 'Zsr.vercel.app', // Domain of your site
      base_url: 'https://zsr.vercel.app', // Your production URL
      auth_endpoint: 'oauth', // OAuth endpoint provided by the integration
    },
    media_folder: 'site/htdocs/src/lib/images', // Folder for media uploads
    public_folder: '/src/lib/images', // Public URL for the media folder
    collections: [
      {
        name: 'posts',
        label: 'Posts',
        folder: 'site/htdocs/src/lib/posts', // Folder containing posts
        create: true, // Allow creation of new posts
        preview_path_date_field: 'date', // Field used for preview path
        slug: '{{slug}}', // Slug format for posts
        fields: [
          { label: 'Title', name: 'title', widget: 'string' }, // Title field
          { label: 'Publish Date', name: 'date', widget: 'datetime' }, // Publish date field
          { label: 'Body', name: 'body', widget: 'markdown' }, // Body content field
        ],
      },
    ],
  };

  return json(config, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
