import { posts } from '#lib/data/posts.js'
import { paginate } from '#lib/util.js'

export const POSTS_PER_PAGE = 10

/** Number of pages of the news list (at least 1, even without posts) */
export const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE))

/**
 * Data of one page of the news list. Server-only, like posts.js.
 * @param {number} page 1-based page number
 */
export function getNewsPage(page) {
  return {
    posts: paginate(posts, { limit: POSTS_PER_PAGE, page }),
    page,
    limit: POSTS_PER_PAGE,
    total: posts.length
  }
}
