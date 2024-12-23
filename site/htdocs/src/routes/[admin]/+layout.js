import { dev } from '$app/environment';
import { PUBLIC_GITHUB_ID, PUBLIC_GITHUB_SECRET, PUBLIC_GITHUB_REPO } from '$env/static/public';

// Enable client-side rendering only in development mode for hot module replacement
export const csr = dev;

// Disable prerendering since this is an admin section that needs dynamic data
export const prerender = false;

// CMS configuration options with default values
const defaultOptions = {
    decapCMSSrcUrl: 'https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js',
    decapCMSVersion: '3.3.3',
    adminDisabled: false,
    adminRoute: '/admin',
    oauthDisabled: false,
    oauthLoginRoute: '/oauth',
    oauthCallbackRoute: '/oauth/callback'
};

// Validate routes to ensure they start with '/'
function validateRoutes(options) {
    const { adminRoute, oauthLoginRoute, oauthCallbackRoute } = options;

    if (!adminRoute.startsWith('/') || !oauthLoginRoute.startsWith('/') || !oauthCallbackRoute.startsWith('/')) {
        throw new Error('adminRoute, oauthLoginRoute, and oauthCallbackRoute options must start with "/"');
    }
    return true;
}

// Initialize CMS configuration by merging default and custom options
function initCMSConfig(customOptions = {}) {
    const options = {
        ...defaultOptions,
        ...customOptions
    };

    validateRoutes(options);
    return options;
}

// Layout load function to pass CMS configuration to child routes
export const load = async () => {
    try {
        const config = initCMSConfig();

        // Check if GitHub OAuth is configured using SvelteKit's environment variables
        const githubConfig = {
            clientId: PUBLIC_GITHUB_ID || '',
            clientSecret: PUBLIC_GITHUB_SECRET || '',
            repoId: PUBLIC_GITHUB_REPO || ''
        };

        // Initialize Sveltia CMS config
        const cmsConfig = {
            ...config,
            backend: {
                name: 'github',
                repo: githubConfig.repoId,
                branch: 'main',
                auth_endpoint: config.oauthLoginRoute,
                base_url: 'https://api.github.com',
                auth_type: 'implicit'
            },
            load_config_file: false,
            media_folder: 'static/uploads',
            public_folder: '/uploads',
            collections: [] // Define your collections here
        };

        return {
            cmsConfig,
            oauth: {
                enabled: !config.oauthDisabled && !!githubConfig.clientId,
                github: githubConfig.clientId ? { repoId: githubConfig.repoId } : null
            }
        };
    } catch (error) {
        console.error('Error loading CMS configuration:', error);
        throw error;
    }
};
