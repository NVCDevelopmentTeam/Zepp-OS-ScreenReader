import { posts } from '$lib/data/posts.js'

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  return {
    posts: posts.slice(0, 5)
  }
}