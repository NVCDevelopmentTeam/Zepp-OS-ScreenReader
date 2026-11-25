import { anchors } from '@mdsvex/plugin-anchors'
import { page_data } from '@mdsvex/plugin-page-data'
import { toc } from '@mdsvex/plugin-toc'

export default {
  extensions: ['.svx', '.md'],
  smart_punctuation: true,
  heading_ids: true,
  unwrap_images: true,
  plugins: [
    anchors(),
    page_data(),
    toc({
      min_depth: 2,
      max_depth: 6
    })
  ]
}
