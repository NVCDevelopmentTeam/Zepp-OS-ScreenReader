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
    this.enabled = false;
    /** @type {boolean} */
    this.isProcessing = false;
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
    this.queue = [];
    await this.tts.stop();
  }

  /**
   * @returns {Promise<boolean>}
   * @private
   */
  async processQueue() {
    if (this.isProcessing) return false;
    if (!this.queue.length || !this.enabled) {
      return this.resetState();
    }

    this.isProcessing = true;
    this.speaking = true;
    this.processingLock = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        await this.processSpeechItem(item);
      }
    }
    this.isProcessing = false;
    this.speaking = false;
    this.processingLock = false;
    return true;
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
    this.isProcessing = false;
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
      await this.tts.synthesize(item.text);
      if (item.options.feedback !== false) {
        await this.vibration.vibrate('info');
      }
      this.emit('speak', item);
      return true;
    } catch (error) {
      this.handleError(error);
      return false;
    }
  }
}

export default new ScreenReader();
