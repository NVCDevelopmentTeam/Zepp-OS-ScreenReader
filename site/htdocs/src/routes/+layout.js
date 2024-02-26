// remove this if you do not want your pages to be prerendered
export const prerender = true
import { inject } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

injectSpeedInsights();
