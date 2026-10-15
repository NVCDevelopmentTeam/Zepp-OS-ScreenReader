import { log } from '@zos/utils'
import { getStored, setStored } from '../utils/storage.js'

const STORAGE_KEY = 'customLabels'
/** Keeps storage small: a watch has little room and long labels are tedious to hear. */
const MAX_LABELS = 100
const MAX_LABEL_LENGTH = 80

/**
 * Stable key for an on-screen element, so a label the user gave it is found again.
 * Elements without an id or text are told apart by type and position.
 * @param {number} type widget type
 * @param {any} options widget options
 * @returns {string}
 */
export function elementLabelKey(type, options) {
  const o = options || {}
  const identity = o.id || o.text || o.accessibility_text || `${o.x},${o.y}`
  return `${type}:${identity}`
}

/**
 * Labels the user gave to elements the app left unnamed (or named badly).
 * They are kept across restarts.
 */
class CustomLabelManager {
  constructor() {
    /** @type {Record<string, string>} */
    this.customLabels = {}
    this.loadLabels()
  }

  /**
   * @param {string} elementId from elementLabelKey()
   * @param {string} label
   */
  addLabel(elementId, label) {
    if (!elementId || !label) {
      throw new Error('Element ID and label are required')
    }
    if (!(elementId in this.customLabels) && Object.keys(this.customLabels).length >= MAX_LABELS) {
      throw new Error('Too many custom labels')
    }
    this.customLabels[elementId] = String(label).slice(0, MAX_LABEL_LENGTH)
    this.saveLabels()
  }

  /** @param {string} elementId */
  removeLabel(elementId) {
    if (!elementId) {
      throw new Error('Element ID is required')
    }
    delete this.customLabels[elementId]
    this.saveLabels()
  }

  /** @param {string} elementId */
  getLabel(elementId) {
    return this.customLabels[elementId] || null
  }

  /** @param {string} elementId */
  hasLabel(elementId) {
    return !!this.customLabels[elementId]
  }

  /** Save labels to storage */
  saveLabels() {
    try {
      setStored(STORAGE_KEY, JSON.stringify(this.customLabels))
    } catch (error) {
      log.warn('Failed to save custom labels: ' + String(error))
    }
  }

  /** Load labels from storage */
  loadLabels() {
    try {
      const labelsJSON = getStored(STORAGE_KEY)
      if (labelsJSON) {
        const parsed = JSON.parse(labelsJSON)
        if (parsed && typeof parsed === 'object') this.customLabels = parsed
      }
    } catch (error) {
      log.warn('Failed to load custom labels: ' + String(error))
    }
  }
}

export default new CustomLabelManager()
