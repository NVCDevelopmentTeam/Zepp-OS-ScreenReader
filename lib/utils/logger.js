import { log } from '@zos/utils'

export const logger = {
  error: (message, error) => {
    log.error(`[Error] ${message}`, error?.message || error)
  },

  warn: (message) => {
    log.warn(`[Warning] ${message}`)
  },

  info: (message) => {
    log.info(`[Info] ${message}`)
  },

  debug: (message) => {
    if (__DEV__) {
      log.debug(`[Debug] ${message}`)
    }
  }
}
