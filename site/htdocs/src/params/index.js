import { defineParams } from '@sveltejs/kit/params'

export const params = defineParams({
  /**
   * A page number of the news list: /news/2/, /news/3/ ...
   * Digits only, so that it never takes over /news/<post-slug>/.
   */
  pagenum: (param) => (/^[1-9]\d*$/.test(param) ? Number(param) : undefined)
})
