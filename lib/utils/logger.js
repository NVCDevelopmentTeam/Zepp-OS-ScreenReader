import { log as Logger } from '@zos/utils'
import { pushError } from './errorBuffer.js'

const logInstance = Logger

export const logger = {
  error: (message, error) => {
    pushError('error', `${message} - ${error?.message || error}`)
    logInstance.error(`[Error] ${message} - ${error?.message || error}`)
  },

  warn: (message) => {
    logInstance.warn(`[Warning] ${message}`)
  },

  info: (message) => {
    logInstance.info(`[Info] ${message}`)
  },

  debug: (message) => {
    logInstance.debug(`[Debug] ${message}`)
  }
}
