import { error } from '@sveltejs/kit'
import { getNewsPage, totalPages } from '#lib/data/news-pages.js'

// The site is static: one page is prerendered for every page of the list from 2 on
// (/news/2/, /news/3/ ...; page 1 is /news/). It follows the number of posts, so new posts add pages by themselves.
export const entries = () =>
  Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({ page: i + 2 }))

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  // the `pagenum` matcher (src/params/index.js) already turned it into a number
  const page = params.page

  // if the page doesn't exist, 404
  if (page < 2 || page > totalPages) {
    error(404, 'Page not found')
  }

  return getNewsPage(page)
}
