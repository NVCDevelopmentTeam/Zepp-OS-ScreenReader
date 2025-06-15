const BRAILLE_DOTS = {
  DOT1: 0x01,
  DOT2: 0x02,
  DOT3: 0x04,
  DOT4: 0x08,
  DOT5: 0x10,
  DOT6: 0x20,
  DOT7: 0x40,
  DOT8: 0x80
};

class BrailleKeyboard {
  constructor(mode = '6dot') {
    this.mode = mode;
    this.currentPattern = 0;
    this.listeners = new Set();
    this.brailleBase = 0x2800; // Unicode Braille Pattern base
  }

  toggleDot(dotNumber) {
    if (dotNumber < 1 || dotNumber > (this.mode === '8dot' ? 8 : 6)) {
      return false;
    }
    this.currentPattern ^= (1 << (dotNumber - 1));
    this.notifyListeners();
    return true;
  }

  getCurrentPattern() {
    return this.currentPattern;
  }

  getUnicodeBraille() {
    return String.fromCharCode(this.brailleBase + this.currentPattern);
  }

  clear() {
    this.currentPattern = 0;
    this.notifyListeners();
  }

  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback);
      return true;
    }
    return false;
  }

  removeListener(callback) {
    return this.listeners.delete(callback);
  }

  notifyListeners() {
    const event = {
      pattern: this.currentPattern,
      unicode: this.getUnicodeBraille(),
      timestamp: Date.now()
    };
    this.listeners.forEach(listener => listener(event));
  }

  setMode(mode) {
    if (mode === '6dot' || mode === '8dot') {
      this.mode = mode;
      this.clear();
      return true;
    }
    return false;
  }
}

export { BrailleKeyboard, BRAILLE_DOTS };
