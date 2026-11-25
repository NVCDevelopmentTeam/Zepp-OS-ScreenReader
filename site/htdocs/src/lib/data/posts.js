import { browser } from '$app/env'

if (browser) {
  throw new Error('Posts should be imported server-side only')
}

const WORDS_PER_MINUTE = 200

/**
 * Normalizes a frontmatter date value to an ISO calendar date string (YYYY-MM-DD)
 * without shifting by the local timezone offset.
 *
 * @param {string | Date | undefined} value
 * @returns {string | undefined}
 */
function normalizePostDate(value) {
  if (!value) return undefined

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString().split('T')[0]
  }

  if (typeof value === 'string') {
    const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})/)
    if (match) return match[1]

    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().split('T')[0]
  }

  return undefined
}

/**
 * Calculates a human-readable reading time estimate from plugin page data.
 * Ensures at least 1 minute for any post.
 *
 * @param {any} page
 * @returns {string}
 */
function formatReadingTime(page) {
  const words = typeof page?.words === 'number' && Number.isFinite(page.words) ? page.words : null
  const rawMinutes =
    words !== null
      ? Math.ceil(words / WORDS_PER_MINUTE)
      : typeof page?.minutes === 'number' && Number.isFinite(page.minutes)
        ? Math.ceil(page.minutes)
        : 0

  const minutes = Math.max(1, rawMinutes)
  return `${minutes} min read`
}

// Main function to import and process all Markdown posts (fetches metadata and plugin_data via ?data)
export const posts = Object.entries(
  import.meta.glob('/src/lib/posts/**/*.md', { eager: true, query: '?data' })
)
  .map(([filepath, mod]) => {
    const post = /** @type {any} */ (mod)
    const metadata = post.metadata ?? {}
    const page = post.plugin_data?.page

    // metadata.preview is a custom string; if absent, use excerpt (first paragraph or text before <!-- more -->)
    const preview = typeof metadata.preview === 'string' ? metadata.preview : (page?.excerpt ?? '')

    const readingTime =
      typeof metadata.readingTime === 'string' && metadata.readingTime.trim()
        ? metadata.readingTime.trim()
        : formatReadingTime(page)

    const date = normalizePostDate(metadata.date)
    const timestamp = metadata.date ? new Date(metadata.date).getTime() : 0

    return {
      ...metadata,

      // Retrieve headings from mdsvex 1.0 plugin_data (toc.headings contains { depth, id, text })
      headings: (
        post.plugin_data?.toc?.headings ??
        post.plugin_data?.headings?.headings ??
        metadata.headings ??
        []
      ).map((/** @type {any} */ h) => ({
        ...h,
        value: h.text ?? h.value ?? '',
        text: h.text ?? h.value ?? ''
      })),

      // Generate slug based on file path
      slug: filepath
        .replace(/(\/index)?\.md$/, '')
        .split('/')
        .pop(),

      // Check if file is an index file
      isIndexFile: filepath.endsWith('/index.md'),

      // Normalized ISO calendar date (YYYY-MM-DD)
      date,
      timestamp: Number.isNaN(timestamp) ? 0 : timestamp,

      // Include preview text and reading time estimate
      preview: {
        html: preview,
        text: preview
      },
      readingTime
    }
  }) // Filter out posts that are unpublished or marked as hidden
  .filter((post) => {
    if (!post.date) return false

    const isPublished = new Date() >= new Date(post.date)
    const isHidden = !!post.hidden

    return isPublished && !isHidden
  }) // Sort posts by timestamp (most recent first)
  .sort(
    (a, b) => b.timestamp - a.timestamp || new Date(b.date).getTime() - new Date(a.date).getTime()
  ) // Link to the next and previous published posts for navigation
  .map((post, index, allPosts) => ({
    ...post,
    next: allPosts[index - 1] || null,
    previous: allPosts[index + 1] || null
  }))
