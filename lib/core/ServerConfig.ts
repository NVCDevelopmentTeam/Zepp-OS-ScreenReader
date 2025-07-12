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
  private debugMode: boolean;
  private lastError: Error | null = null;
  private debugStats = {
    totalSpoken: 0,
    errors: 0,
    startTime: Date.now()
  };

  constructor() {
    super();
    this.tts = new TTSEngineImpl();
    this.vibration = new VibrationManager();
    this.sound = new SoundFeedback();
    this.queue = [];
    this.speaking = false;
    this.enabled = false;
    this.debugMode = false;
  }

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    this.emit('debug', `Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

   
  private logDebug(message: string, data?: any): void {
    if (this.debugMode) {
      log.debug(`[ScreenReader] ${message}`, data || '');
      this.emit('debugLog', { message, data });
    }
  }

  async init(): Promise<boolean> {
    try {
      this.logDebug('Initializing screen reader');
      await this.tts.init();
      this.enabled = true;
      this.logDebug('Screen reader initialized successfully');
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
    
    this.logDebug('Adding speech item to queue', {
      text: item.text,
      priority: item.priority,
      queueLength: this.queue.length
    });

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
      this.logDebug('Queue processing complete', {
        totalSpoken: this.debugStats.totalSpoken,
        uptime: Date.now() - this.debugStats.startTime
      });
      return this.resetState();
    }

    try {
      if (this.speaking) return false;
      
      this.speaking = true;
      const item = this.queue.shift();
      if (item) {
        const startTime = Date.now();
        await this.processSpeechItem(item);
        this.logDebug('Speech processing time', {
          duration: Date.now() - startTime,
          queueRemaining: this.queue.length
        });
        this.debugStats.totalSpoken++;
      }
      
      this.speaking = false;
      return this.queue.length ? this.processQueue() : true;
    } catch (error) {
      this.debugStats.errors++;
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
    this.lastError = error instanceof Error ? error : new Error(String(error));
    this.logDebug('Error occurred', {
      error: this.lastError.message,
      totalErrors: this.debugStats.errors
    });
    this.emit('error', this.lastError);
    log.error('[ScreenReader Error]:', this.lastError.message);
    return false;
  }

  private async processSpeechItem(item: SpeechItem): Promise<boolean> {
    if (!item?.text) return false;
    
    try {
      this.speaking = true;
      this.logDebug('Processing speech item:', item);
      await this.tts.synthesize(item.text);
      if (item.options.feedback !== false) {
        await this.vibration.vibrate('info');
      }
      this.emit('speak', item);
      this.speaking = false;
      this.logDebug('Speech item processed successfully');
      return true;
    } catch (error) {
      this.handleError(error);
      return false;
    }
  }

  getDebugInfo(): object {
    return {
      enabled: this.enabled,
      speaking: this.speaking,
      queueLength: this.queue.length,
      debugMode: this.debugMode,
      lastError: this.lastError
    };
  }
}

export default new ScreenReader();