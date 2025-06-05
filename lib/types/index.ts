export interface SpeechOptions {
  priority?: 'normal' | 'high';
  voice?: string;
  pitch?: number;
  rate?: number;
  [key: string]: any;
}

export interface SpeechItem {
  text: string;
  options: SpeechOptions;
  timestamp: number;
  priority: 'normal' | 'high';
}

export interface TTSConfig {
  voice: string;
  pitch: number;
  rate: number;
}

export interface TTSEngine {
  init(): Promise<boolean>;
  synthesize(text: string, options?: SpeechOptions): Promise<boolean>;
  stop(): Promise<void>;
  setVoice(voice: string): void;
  setPitch(pitch: number): void;
  setRate(rate: number): void;
}

export type EventHandler = (...args: any[]) => void;

export type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'click';