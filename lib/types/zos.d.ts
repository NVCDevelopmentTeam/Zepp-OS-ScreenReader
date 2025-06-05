declare module '@zos/utils' {
  export const log: {
    error(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    debug(message: string, ...args: unknown[]): void;
  };
}

declare module '@zos/sensor' {
  export const vibrate: {
    start(): void;
    stop(): void;
  };
}

declare module '@zos/media' {
  interface PlaySoundOptions {
    path: string;
    volume?: number;
    onComplete?: () => void;
    onError?: (error: unknown) => void;
  }

  export const player: {
    setVolume(volume: number): void;
    playSound(options: PlaySoundOptions): void;
    stop(): void;
  };
}