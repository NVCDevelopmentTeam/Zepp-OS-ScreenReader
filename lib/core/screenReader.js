import { log } from '@zos/utils';
import TTSEngine from '../TTSSystem/EspeakTTSEngine.js';
import { VibrationManager } from '../feedback/vibrateFeedback.js';
import { SoundFeedback } from '../feedback/soundFeedback.js';
import { EventEmitter } from '../utils/eventEmitter.js';

/**
 * @typedef {Object} SpeechOptions
 * @property {('normal'|'high')} [priority]
 * @property {string} [voice]
 * @property {number} [pitch]
 * @property {number} [rate]
 * @property {boolean} [feedback]
 */

/**
 * @typedef {Object} QueueItem
 * @property {string} text - Text to speak
 * @property {SpeechOptions} options - Speech options
 * @property {number} timestamp - Time when item was queued
 * @property {'normal'|'high'} priority - Item priority
 */

/**
 * Screen reader implementation for Zepp OS
 * @extends EventEmitter
 */
class ScreenReader extends EventEmitter {
  constructor() {
    super();
    /** @type {TTSEngine} */
    this.tts = new TTSEngine();
    /** @type {VibrationManager} */
    this.vibration = new VibrationManager();
    /** @type {SoundFeedback} */
    this.sound = new SoundFeedback();
    /** @type {QueueItem[]} */
    this.queue = [];
    /** @type {boolean} */
    this.speaking = false;
    /** @type {boolean} */
    this.enabled = false;
    /** @type {boolean} */
    this.processingLock = false; // Add mutex lock
  }

  async init() {
    try {
      await this.tts.init();
      this.enabled = true;
      this.emit('ready');
      return true;
    } catch (error) {
      this.handleError(error);
      return false;
    }
  }

  /**
   * @param {string} text - The text to speak
   * @param {SpeechOptions} [options={}] - Speech options
   * @returns {Promise<boolean>} - Success status
   */
  async speak(text, options = {}) {
    if (!this.enabled || !text?.trim()) return false;
    
    const item = { 
      text, 
      options, 
      timestamp: Date.now(),
      priority: options.priority || 'normal'
    };
    
    if (options.priority === 'high') {
      this.queue.unshift(item);
    } else {
      this.queue.push(item);
    }

    if (!this.speaking && !this.processingLock) {
      return this.processQueue();
    }
    return true;
  }

  /**
   * @returns {Promise<void>}
   */
  async stop() {
    if (this.processingLock) {
      await this.waitForLock();
    }
    this.queue = [];
    this.speaking = false;
    await this.tts.stop();
  }

  /**
   * @returns {Promise<boolean>}
   * @private
   */
  async processQueue() {
    if (this.processingLock) return false;
    if (!this.queue.length || !this.enabled) {
      return this.resetState();
    }

    try {
      if (this.speaking) return false;
      
      this.processingLock = true;
      this.speaking = true;
      const item = this.queue.shift();
      if (item) {
        await this.processSpeechItem(item);
      }
      
      this.speaking = false;
      this.processingLock = false;
      return this.queue.length ? this.processQueue() : true;
    } catch (error) {
      this.processingLock = false;
      return this.handleError(error);
    }
  }

  /**
   * @param {number} [timeout=1000] - Timeout in milliseconds
   * @returns {Promise<void>}
   * @private
   */
  async waitForLock(timeout = 1000) {
    const startTime = Date.now();
    while (this.processingLock) {
      if (Date.now() - startTime > timeout) {
        throw new Error('Lock wait timeout');
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  /**
   * @returns {boolean}
   * @private
   */
  resetState() {
    this.queue = [];
    this.speaking = false;
    this.emit('idle');
    return true;
  }

  /**
   * @param {unknown} error - The error to handle
   * @returns {boolean}
   * @private
   */
  handleError(error) {
    this.speaking = false;
    this.queue = [];
    this.emit('error', error);
    log.error('Screen reader error:', error instanceof Error ? error.message : String(error));
    return false;
  }

  /**
   * @param {QueueItem} item - Speech item to process
   * @returns {Promise<boolean>}
   * @private
   */
  async processSpeechItem(item) {
    if (!item?.text) return false;
    
    try {
      this.speaking = true;
      await this.tts.synthesize(item.text);
      if (item.options.feedback !== false) {
        await this.vibration.vibrate('info');
      }
      this.emit('speak', item);
      this.speaking = false;
      return true;
    } catch (error) {
      this.handleError(error);
      return false;
    }
  }
}

export default new ScreenReader();
