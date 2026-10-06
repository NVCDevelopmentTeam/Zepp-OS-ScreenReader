import { defineEnvVars } from '@sveltejs/kit/env'

export const variables = defineEnvVars({
  OAUTH_GITHUB_CLIENT_ID: { static: true },
  OAUTH_GITHUB_CLIENT_SECRET: { static: true }
})
