import { posts } from '#lib/data/posts.js'
import { siteTitle, siteDescription, siteURL } from '#lib/info.js'
import { escapeXml } from '#lib/util.js'

export const prerender = true

const websiteDescription = `${siteTitle} - ${siteDescription}`
const postsUrl = `${siteURL}/news`

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function GET({ setHeaders }) {
  setHeaders({
    'Cache-Control': 'max-age=0, s-maxage=600',
    'Content-Type': 'application/xml; charset=utf-8'
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/"
                    xmlns:content="http://purl.org/rss/1.0/modules/content/"
                    xmlns:atom="http://www.w3.org/2005/Atom"
                    version="2.0">
    <channel>
      <title>${escapeXml(siteTitle)}</title>
      <link>${siteURL}</link>
      <description>${escapeXml(websiteDescription)}</description>
      <language>en-us</language>
      <atom:link href="${siteURL}/rss.xml" rel="self" type="application/rss+xml" />
      ${posts
        .map(
          (post) => `
        <item>
          <guid>${postsUrl}/${post.slug}/</guid>
          <title>${escapeXml(post.title)}</title>
          <description>${escapeXml(post.preview.text)}</description>
          <link>${postsUrl}/${post.slug}/</link>
          <pubDate>${new Date(post.date).toUTCString()}</pubDate>
        </item>`
        )
        .join('')}
    </channel>
  </rss>`

  return new Response(xml)
}
