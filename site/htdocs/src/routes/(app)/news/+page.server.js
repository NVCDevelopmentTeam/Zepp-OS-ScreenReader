import { posts } from '$lib/data/posts'
import { paginate } from '$lib/util'
import { error } from '@sveltejs/kit'

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
  let page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page')) : 1
  let limit = 10

  const postsForPage = paginate(posts, { limit, page })

  // if page doesn't exist, 404
  if (postsForPage.length === 0 && page > 1) {
    error(404, 'Page not found')
  }

  return {
    posts: postsForPage,
    page,
    limit
  }
}
