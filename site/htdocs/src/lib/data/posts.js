import { browser } from '$app/environment'
import { format, isAfter } from 'date-fns'
import { parse } from 'node-html-parser'
import readingTime from 'reading-time/lib/reading-time.js'

if (browser) {
  throw new Error('Posts should be imported server-side only')
}

// Adjust for timezone offset based on user's timezone
function addTimezoneOffset(date) {
  const offsetInMilliseconds = new Date().getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() + offsetInMilliseconds)
}

// Main function to import and process all Markdown posts
export const posts = Object.entries(import.meta.glob('/src/lib/posts/**/*.md', { eager: true }))
  .map(([filepath, post]) => {
    const htmlContent = post.default // Access rendered HTML of the post
    const html = parse(htmlContent)

    // Obtain preview text for each post
    const previewElement = post.metadata.preview || html.querySelector('p')
    const preview = previewElement ? previewElement.innerText || previewElement.textContent : ''

    return {
      ...post.metadata,

      // Generate slug based on file path
      slug: filepath
        .replace(/(\/index)?\.md/, '')
        .split('/')
        .pop(),

      // Check if file is an index file
      isIndexFile: filepath.endsWith('/index.md'),

      // Format date, applying timezone offset
      date: post.metadata.date
        ? format(addTimezoneOffset(new Date(post.metadata.date)), 'yyyy-MM-dd')
        : undefined,

      // Include preview text and reading time estimate
      preview: {
        html: preview,
        text: preview
      },
      readingTime: readingTime(html.textContent || '').text
    }
  })
  // Sort posts by date (most recent first)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  // Add links to next and previous posts for navigation
  .map((post, index, allPosts) => ({
    ...post,
    next: allPosts[index - 1] || null,
    previous: allPosts[index + 1] || null
  }))
  // Filter out posts that are unpublished or marked as hidden
  .filter((post) => {
    const isPublished = isAfter(new Date(), new Date(post.date))
    const isHidden = !!post.hidden
    return isPublished && !isHidden
  })
