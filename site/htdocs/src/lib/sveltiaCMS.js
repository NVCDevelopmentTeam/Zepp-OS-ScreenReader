import { env } from '$env/dynamic/private';

export function sveltiaCMS(options = {}) {
  const defaultOptions = {
    sveltiaCMSSrcUrl: "https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js",
    sveltiaCMSVersion: "",
    adminDisabled: false,
    adminRoute: "/admin",
    oauthDisabled: false,
    oauthLoginRoute: "/oauth",
    oauthCallbackRoute: "/oauth/callback",
  };

  const {
    sveltiaCMSSrcUrl,
    sveltiaCMSVersion,
    adminDisabled,
    adminRoute,
    oauthDisabled,
    oauthLoginRoute,
    oauthCallbackRoute,
  } = {
    ...defaultOptions,
    ...options,
  };

  if (!adminRoute?.startsWith("/") || !oauthLoginRoute?.startsWith("/") || !oauthCallbackRoute?.startsWith("/")) {
    throw new Error('`adminRoute`, `oauthLoginRoute` and `oauthCallbackRoute` options must start with "/"');
  }

  return {
    name: "sveltekit-sveltia-cms-oauth",
    setup({ injectRoute, updateConfig }) {
      const envConfig = {
        validateSecrets: true,
        schema: {},
      };

      if (!adminDisabled) {
        envConfig.schema.PUBLIC_SVELTIA_CMS_SRC_URL = {
          context: "client",
          access: "public",
          optional: true,
          default: sveltiaCMSSrcUrl,
        };
        envConfig.schema.PUBLIC_SVELTIA_CMS_VERSION = {
          context: "client",
          access: "public",
          optional: true,
          default: sveltiaCMSVersion,
        };

        // mount SveltiaCMS admin route
        injectRoute({
          pattern: adminRoute,
          entrypoint: "src/routes/admin/+page.svelte",
        });
      }

      if (!oauthDisabled) {
        envConfig.schema.OAUTH_GITHUB_CLIENT_ID = {
          context: "server",
          access: "secret",
        };
        envConfig.schema.OAUTH_GITHUB_CLIENT_SECRET = {
          context: "server",
          access: "secret",
        };
        envConfig.schema.OAUTH_GITHUB_REPO_ID = {
          context: "server",
          access: "secret",
          optional: true,
          default: "",
        };

        // mount OAuth backend - sign in route
        injectRoute({
          pattern: oauthLoginRoute,
          entrypoint: "src/routes/(user)/(config)/oauth/+server.js",
        });

        // mount OAuth backend - callback route
        injectRoute({
          pattern: oauthCallbackRoute,
          entrypoint: "src/routes/(user)/(config)/oauth/callback/+server.js",
        });
      }

      // apply env schema & defaults
      updateConfig({ env: envConfig });
    },
  };
}