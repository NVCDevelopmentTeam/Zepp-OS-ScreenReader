export const KEYBOARD_MODES = {
  NAVIGATION: 'navigation',
  INPUT: 'input',
  NUMERIC: 'numeric'
};

class VirtualKeyboard {
  constructor() {
    this.mode = KEYBOARD_MODES.NAVIGATION;
    this.listeners = new Set();
    this.modifiers = {
      shift: false,
      ctrl: false
    };
  }

  setMode(mode) {
    if (Object.values(KEYBOARD_MODES).includes(mode)) {
      this.mode = mode;
      return true;
    }
    return false;
  }

  addKeyListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback);
      return true;
    }
    return false;
  }

  removeKeyListener(callback) {
    return this.listeners.delete(callback);
  }

  handleKeyEvent(keyCode, isKeyDown = true) {
    const keyEvent = {
      keyCode,
      mode: this.mode,
      modifiers: { ...this.modifiers },
      timestamp: Date.now()
    };

    this.listeners.forEach(listener => listener(keyEvent));
  }

  setModifier(modifier, state) {
    if (modifier in this.modifiers) {
      this.modifiers[modifier] = Boolean(state);
      return true;
    }
    return false;
  }

  reset() {
    this.mode = KEYBOARD_MODES.NAVIGATION;
    this.modifiers.shift = false;
    this.modifiers.ctrl = false;
    this.listeners.clear();
  }
}

export default VirtualKeyboard;
