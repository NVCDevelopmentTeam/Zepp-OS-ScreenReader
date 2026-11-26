import { getNewsPage } from '#lib/data/news-pages.js'

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  // Page 1 of the news list. The other pages are prerendered under /news/page/N/
  return getNewsPage(1)
}
