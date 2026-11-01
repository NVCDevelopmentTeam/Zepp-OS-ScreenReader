import { posts } from '#lib/data/posts.js'
import { error } from '@sveltejs/kit'

// Pre-render every published post, not only the ones linked from the home page
export const entries = () => posts.map(({ slug }) => ({ slug }))

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const { slug } = params

  // get post with metadata
  const post = posts.find((post) => slug === post.slug)

  if (!post) {
    error(404, 'Post not found')
  }

  return {
    post
  }
}
