/** @type {import('@zos/sensor').vibrate} */
export const vibrate = {
  start() {},
  stop() {}
};

/** @type {import('@zos/media').player} */
export const player = {
  setVolume(volume) {},
  playSound(options) {},
  stop() {}
};

/** @type {import('@zos/utils').log} */
export const log = {
  error(message, ...args) {},
  warn(message, ...args) {},
  info(message, ...args) {},
  debug(message, ...args) {}
};