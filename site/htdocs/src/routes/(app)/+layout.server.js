import { isMobile } from '$lib/util';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ setHeaders, request }) {
  const ua = request.headers.get('user-agent') || '';
  const mobile = isMobile(ua);

  setHeaders({
    'cache-control': 'public, max-age=3600, s-maxage=3600'
  });

  return {
    isMobile: mobile
  };
}
