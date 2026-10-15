import { gettext, format } from '../utils/i18n.js'

/**
 * Turn CAPTCHA text into a character-by-character description that is unambiguous when
 * spoken ("Capital A, Letter b, Number 7").
 * @param {string} captchaText
 * @returns {{ success: true, text: string, original: string } | { success: false, error: string, details: string }}
 */
const readCaptcha = (captchaText) => {
  try {
    const characters = String(captchaText).split('')

    const processedText = characters
      .map((char) => {
        if (/[0-9]/.test(char)) {
          return format(gettext('Number {0}'), char)
        } else if (/[A-Z]/.test(char)) {
          return format(gettext('Capital {0}'), char)
        } else if (/[a-z]/.test(char)) {
          return format(gettext('Letter {0}'), char)
        }
        return format(gettext('Symbol {0}'), char)
      })
      .join(', ')

    return {
      success: true,
      text: processedText,
      original: captchaText
    }
  } catch (/** @type {any} */ error) {
    return {
      success: false,
      error: gettext('Failed to process CAPTCHA'),
      details: error.message
    }
  }
}

export default readCaptcha
