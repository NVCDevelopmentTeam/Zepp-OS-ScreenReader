/** @type {import('./$types').LayoutServerLoad} */
export async function load({ setHeaders }) {
  setHeaders({
    'cache-control': 'public, max-age=3600, s-maxage=3600'
  })
}
