import { defineEnvVars } from '@sveltejs/kit/env'

// Read at runtime from the Cloudflare environment, so the secrets are never inlined into the
// build output. They are optional at build time; the OAuth endpoints report when they are missing.
const optional = (/** @type {string | undefined} */ value) => value || undefined

export const variables = defineEnvVars({
  OAUTH_GITHUB_CLIENT_ID: { schema: optional },
  OAUTH_GITHUB_CLIENT_SECRET: { schema: optional }
})
