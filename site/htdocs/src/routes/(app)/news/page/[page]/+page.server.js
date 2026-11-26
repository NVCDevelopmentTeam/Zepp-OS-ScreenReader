import { error } from '@sveltejs/kit'
import { getNewsPage, totalPages } from '#lib/data/news-pages.js'

// The site is static: one page is prerendered for every page of the list from 2 on
// (page 1 is /news/). It follows the number of posts, so new posts add pages by themselves.
export const entries = () =>
  Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({ page: String(i + 2) }))

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const page = Number(params.page)

  // if the page doesn't exist, 404
  if (!Number.isInteger(page) || page < 2 || page > totalPages) {
    error(404, 'Page not found')
  }

  return getNewsPage(page)
}
