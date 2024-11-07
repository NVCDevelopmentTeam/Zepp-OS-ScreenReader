// remove this if you do not want your pages to be prerendered
import { dev } from '$app/environment';
import { inject } from '@vercel/analytics';
 
inject({ mode: dev ? 'development' : 'production' });
export const ssr = true;

import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

injectSpeedInsights();
