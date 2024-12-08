import { json } from '@sveltejs/kit';

export async function GET() {
  const config = {
    backend: {
      name: 'github',
      repo: 'NVCDevelopmentTeam/Zepp-OS-ScreenReader',
      branch: 'main',
      site_domain: 'zsr.vercel.app',
    },
    media_folder: 'site/htdocs/src/lib/images',
    public_folder: '/src/lib/images',
    collections: [
      {
        name: 'posts',
        label: 'Posts',
        folder: 'site/htdocs/src/lib/posts',
        create: true,
        preview_path_date_field: 'date',
        slug: '{{slug}}',
        fields: [
          { label: 'Title', name: 'title', widget: 'string' },
          { label: 'Publish Date', name: 'date', widget: 'datetime' },
          { label: 'Body', name: 'body', widget: 'markdown' },
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
