import '../../lib/utils/polyfills.js'
import { widget } from '@zos/ui'
import { replace } from '@zos/router'
import { gettext, format } from '../../lib/utils/i18n.js'
import { safeDeviceInfo } from '../../lib/utils/deviceInfo.js'
import { px } from '../../lib/utils/px.js'
import { guard, fireAndForget } from '../../lib/utils/safeCall.js'
import { loadSettings } from '../../lib/core/config.js'
import {
  listFavorites,
  addFavorite,
  removeFavorite,
  renameFavorite,
  moveFavorite,
  favoriteName,
  destinationCatalog,
  MAX_FAVORITES
} from '../../lib/core/favorites.js'
import VoiceControlService from '../../lib/core/voiceControlService.js'
import { ZSRPage } from '../../lib/core/zsrPage.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'

const { width } = safeDeviceInfo()

/** @param {string} text */
function announce(text) {
  const reader = globalThis.ScreenReaderInstance
  if (text && reader && typeof reader.speak === 'function') {
    // Speech is feedback; if it fails the failure is recorded, never left unhandled
    fireAndForget(reader.speak(text, { priority: 'high', force: true }), 'speak')
  }
}

/** Show the page again with the new state (the reader keeps running). */
function refresh() {
  replace({ url: 'page/home/Favorites' })
}

/**
 * Favorites: move, rename and remove the ones you have, and switch any other page on or off.
 * Favorites are listed first on the home screen.
 */
export default ZSRPage({
  onInit() {
    if (!globalThis.ScreenReaderConfig) globalThis.ScreenReaderConfig = loadSettings()
  },

  build() {
    const favorites = listFavorites()
    const catalog = destinationCatalog()
    const rows = favorites.length * 2 + catalog.length + 3
    const root = createWidget(widget.GROUP, { x: 0, y: 0, w: width, h: px(rows * 80) })
    let y = 10

    createChild(root, widget.TEXT, {
      x: 0,
      y: px(y),
      w: width,
      h: px(50),
      text: gettext('Favorites'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: px(28)
    })
    y += 60

    if (favorites.length === 0) {
      createChild(root, widget.TEXT, {
        x: px(30),
        y: px(y),
        w: width - px(60),
        h: px(60),
        text: gettext('No favorites yet'),
        color: 0xcccccc,
        text_size: px(22)
      })
      y += 70
    }

    const quarter = (width - px(80) - px(30)) / 4
    favorites.forEach((favorite) => {
      const name = favoriteName(favorite)
      createChild(root, widget.TEXT, {
        x: px(30),
        y: px(y),
        w: width - px(60),
        h: px(55),
        text: name,
        color: 0xffffff,
        text_size: px(24)
      })
      y += 60
      /** @param {string} label @param {number} column @param {() => void} action @param {number} [color] */
      const small = (label, column, action, color = 0x333333) =>
        createChild(root, widget.BUTTON, {
          x: px(40) + column * (quarter + px(10)),
          y: px(y),
          w: quarter,
          h: px(60),
          text: label,
          color: 0xffffff,
          normal_color: color,
          press_color: 0x666666,
          radius: px(20),
          text_size: px(18),
          click_func: guard(action, 'click_func')
        })
      small(gettext('Move up'), 0, () => {
        announce(
          moveFavorite(favorite.url, -1)
            ? format(gettext('Moved up: {0}'), name)
            : gettext('Already first')
        )
        refresh()
      })
      small(gettext('Move down'), 1, () => {
        announce(
          moveFavorite(favorite.url, 1)
            ? format(gettext('Moved down: {0}'), name)
            : gettext('Already last')
        )
        refresh()
      })
      small(gettext('Rename'), 2, async () => {
        announce(gettext('Say the new name'))
        const heard = await VoiceControlService.dictate()
        if (!heard) return
        renameFavorite(favorite.url, heard)
        announce(format(gettext('Favorite renamed: {0}'), heard))
        refresh()
      })
      small(
        gettext('Remove'),
        3,
        () => {
          removeFavorite(favorite.url)
          announce(format(gettext('Removed from favorites: {0}'), name))
          refresh()
        },
        0x884400
      )
      y += 80
    })

    createChild(root, widget.TEXT, {
      x: px(30),
      y: px(y),
      w: width - px(60),
      h: px(50),
      text: format(gettext('Add or remove places ({0} of {1})'), favorites.length, MAX_FAVORITES),
      color: 0xaaaaaa,
      text_size: px(20)
    })
    y += 60

    // One switch for every page that can be a favorite
    catalog.forEach((entry) => {
      createChild(root, widget.TEXT, {
        x: px(30),
        y: px(y),
        w: width - px(150),
        h: px(60),
        text: entry.name,
        color: 0xffffff,
        text_size: px(22),
        align_v: 2
      })
      createChild(root, widget.SLIDE_SWITCH, {
        x: width - px(110),
        y: px(y + 10),
        w: px(80),
        h: px(40),
        checked: favorites.some((f) => f.url === entry.url),
        select_bg: 0x00aa00,
        unselect_bg: 0x666666,
        checked_change_func: (/** @type {boolean} */ checked) => {
          if (checked) {
            const result = addFavorite(entry.url)
            announce(
              result === 'full'
                ? gettext('Favorites are full')
                : format(gettext('Added to favorites: {0}'), entry.name)
            )
          } else {
            removeFavorite(entry.url)
            announce(format(gettext('Removed from favorites: {0}'), entry.name))
          }
          refresh()
        }
      })
      y += 70
    })

    return root
  }
})
