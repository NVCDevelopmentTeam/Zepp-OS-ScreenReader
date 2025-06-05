import { log } from '@zos/utils'
import { TTSEngineImpl } from '../TTSSystem/EspeakTTSEngine'
import { VibrationManager } from '../feedback/vibrateFeedback'
import { SoundFeedback } from '../feedback/soundFeedback'
import { EventEmitter } from '../utils/eventEmitter'
import { SpeechItem, SpeechOptions, TTSEngine } from '../types'

class ScreenReader extends EventEmitter {
  private tts: TTSEngine;
  private vibration: VibrationManager;
  private sound: SoundFeedback;
  private queue: SpeechItem[];
  private speaking: boolean;
  private enabled: boolean;

  constructor() {
    super();
    this.tts = new TTSEngineImpl();
    this.vibration = new VibrationManager();
    this.sound = new SoundFeedback();
    this.queue = [];
    this.speaking = false;
    this.enabled = false;
  }

  async init(): Promise<boolean> {
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

  async speak(text: string, options: SpeechOptions = {}): Promise<boolean> {
    if (!this.enabled || !text?.trim()) return false;
    
    const item: SpeechItem = { 
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

    if (!this.speaking) {
      return this.processQueue();
    }
    return true;
  }

  async stop(): Promise<void> {
    this.queue = [];
    this.speaking = false;
    await this.tts.stop();
  }

  private async processQueue(): Promise<boolean> {
    if (!this.queue.length || !this.enabled) {
      return this.resetState();
    }

    try {
      if (this.speaking) return false;
      
      this.speaking = true;
      const item = this.queue.shift();
      if (item) {
        await this.processSpeechItem(item);
      }
      
      this.speaking = false;
      return this.queue.length ? this.processQueue() : true;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private resetState(): boolean {
    this.queue = [];
    this.speaking = false;
    this.emit('idle');
    return true;
  }

  private handleError(error: unknown): boolean {
    this.speaking = false;
    this.queue = [];
    this.emit('error', error);
    log.error('Screen reader error:', error instanceof Error ? error.message : String(error));
    return false;
  }

  private async processSpeechItem(item: SpeechItem): Promise<boolean> {
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