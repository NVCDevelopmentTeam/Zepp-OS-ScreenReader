// sveltia.config.js

// Configuration object for Sveltia CMS
const config = {
  backend: {
    // Specify the backend service; here, 'github' is used
    name: 'github',
    // Repository information in the format 'owner/repo'
    repo: 'NVCDevelopmentTeam/Zepp-OS-ScreenReader',
    // Branch to be used in the repository
    branch: 'main',
    // Domain where the site is hosted
    site_domain: 'zsr.vercel.app',
    // Base URL of the site
    base_url: 'https://zsr.vercel.app',
    // Endpoint for OAuth authentication
    auth_endpoint: '/oauth'
  },
  // Directory where media files are stored within the project
  media_folder: 'site/htdocs/src/lib/images',
  // Public URL path to access media files
  public_folder: '/src/lib/images',
  collections: [
    {
      // Unique identifier for the collection
      name: 'posts',
      // Display label for the collection
      label: 'Posts',
      // Directory where content files for this collection are stored
      folder: 'site/htdocs/src/lib/posts',
      // Allow creation of new content items in this collection
      create: true,
      // Field used to generate the preview path, typically a date field
      preview_path_date_field: 'date',
      // Template for generating the slug (URL path) of content items
      slug: '{{slug}}',
      fields: [
        {
          // Field for the title of the post
          label: 'Title',
          name: 'title',
          widget: 'string'
        },
        {
          // Field for the publication date of the post
          label: 'Publish Date',
          name: 'date',
          widget: 'datetime'
        },
        {
          // Field for the main content body of the post
          label: 'Body',
          name: 'body',
          widget: 'markdown'
        }
      ]
    }
  ]
};

export default config;
