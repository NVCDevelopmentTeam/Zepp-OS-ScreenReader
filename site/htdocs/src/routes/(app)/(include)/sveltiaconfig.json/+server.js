import { json } from '@sveltejs/kit'

export async function GET() {
  const config = {
    backend: {
      name: 'github',
      repo: 'NVCDevelopmentTeam/Zepp-OS-ScreenReader',
      branch: 'main',
      site_domain: 'zeppreader.com',
      base_url: 'https://www.zeppreader.com',
      auth_endpoint: '/oauth'
    },
    site_url: 'https://www.zeppreader.com',
    display_url: 'https://www.zeppreader.com',
    logo_url: 'https://www.zeppreader.com/logo.jpg',
    // Using relative paths from the root of the repo for GitHub backend compatibility
    media_folder: 'src/lib/images',
    public_folder: 'src/lib/images',
    adminDisabled: false,
    adminRoute: '/admin',
    oauthDisabled: false,
    oauthLoginRoute: '/oauth',
    oauthCallbackRoute: '/oauth/callback',
    collections: [
      {
        name: 'posts',
        label: 'Posts',
        folder: 'src/lib/posts',
        create: true,
        preview_path_date_field: 'date',
        slug: '{{slug}}',
        fields: [
          {
            label: 'Title',
            name: 'title',
            widget: 'string'
          },
          {
            label: 'Publish Date',
            name: 'date',
            widget: 'datetime'
          },
          {
            label: 'Body',
            name: 'body',
            widget: 'markdown'
          }
        ]
      }
    ]
  }

  return json(config)
}
