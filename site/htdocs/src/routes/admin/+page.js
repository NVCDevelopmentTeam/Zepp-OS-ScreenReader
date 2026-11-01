export const prerender = true // Bật tính năng prerender để xuất ra file tĩnh

export const load = async () => {
  try {
    // Khai báo trực tiếp cấu hình hoặc import từ file hằng số dùng chung (ví dụ: config.js)
    // Paths are relative to the root of the Git repository, which contains this site in `site/htdocs`.
    const config = {
      load_config_file: false, // the configuration below is used instead of /admin/config.yml
      backend: {
        name: 'github',
        repo: 'NVCDevelopmentTeam/Zepp-OS-ScreenReader',
        branch: 'main',
        // `base_url` is set in +page.svelte to the current origin, so sign-in also works on localhost
        auth_endpoint: 'admin/oauth'
      },
      site_url: 'https://www.zeppreader.com',
      display_url: 'https://www.zeppreader.com',
      // Sveltia requires an absolute public path: uploads are served from /uploads (static folder)
      media_folder: 'site/htdocs/static/uploads',
      public_folder: '/uploads',
      collections: [
        {
          name: 'posts',
          label: 'Posts',
          folder: 'site/htdocs/src/lib/posts',
          extension: 'md',
          format: 'frontmatter',
          create: true,
          slug: '{{slug}}',
          fields: [
            {
              label: 'Title',
              name: 'title',
              widget: 'string',
              pattern: ['.{3,}', 'Post title must be at least 3 characters long.']
            },
            { label: 'Publish Date', name: 'date', widget: 'datetime' },
            { label: 'Body', name: 'body', widget: 'markdown' }
          ]
        }
      ]
    }

    return {
      config
    }
  } catch (error) {
    console.error('Error loading configuration:', error)
    return {
      config: null,
      error: 'Failed to load configuration'
    }
  }
}
