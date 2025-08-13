import { posts } from '$lib/data/posts'
import { siteURL } from '$lib/info'

export const prerender = true

// Definition of static pages
const staticPages = [
  { loc: `${siteURL}/`, priority: 1.0 },
  { loc: `${siteURL}/about`, priority: 0.8 },
  { loc: `${siteURL}/contact`, priority: 0.8 },
  { loc: `${siteURL}/accessibility-statement`, priority: 0.7 },
  { loc: `${siteURL}/support`, priority: 0.7 },
  { loc: `${siteURL}/privacy-policy`, priority: 0.6 }
]

// Definition of the path for the article
const getPostUrl = (slug) => `${siteURL}/news/${slug}`

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function GET({ setHeaders }) {
  setHeaders({
    'Cache-Control': 'max-age=0, s-max-age=600',
    'Content-Type': 'application/xml'
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                      http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  ${staticPages
    .map(
      (page) => `
    <url>
      <loc>${page.loc}</loc>
      <changefreq>monthly</changefreq>
      <priority>${page.priority}</priority>
    </url>`
    )
    .join('')}
  ${posts
    .map(
      (post) => `
    <url>
      <loc>${getPostUrl(post.slug)}</loc>
      <lastmod>${
        post.updated ? new Date(post.updated).toISOString() : new Date(post.date).toISOString()
      }</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.9</priority>
    </url>`
    )
    .join('')}
</urlset>`

  return new Response(xml)
}
