// keyboard control feature of Zepp OS Screen Reader

export const KEY_MAP = {
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4,
  SELECT: 5
};

class KeyboardController {
  constructor() {
    this.currentFocus = 0;
    this.elements = [];
  }

  setElements(elements) {
    this.elements = elements;
    this.currentFocus = 0;
  }

  handleKeyPress(key) {
    if (!Object.values(KEY_MAP).includes(key)) {
      return false;
    }

    switch(key) {
      case KEY_MAP.UP:
        this.moveFocus(-1);
        break;
      case KEY_MAP.DOWN:
        this.moveFocus(1);
        break;
      case KEY_MAP.LEFT:
        this.moveFocus(-1);
        break;
      case KEY_MAP.RIGHT:
        this.moveFocus(1);
        break;
      case KEY_MAP.SELECT:
        this.selectCurrent();
        break;
    }
    return true;
  }

  moveFocus(direction) {
    if (!this.elements.length) return;
    
    this.currentFocus += direction;
    
    // Handle wrapping around boundaries
    if (this.currentFocus < 0) {
      this.currentFocus = this.elements.length - 1;
    }
    if (this.currentFocus >= this.elements.length) {
      this.currentFocus = 0;
    }
  }

  selectCurrent() {
    if (!this.elements.length) return;
    
    const currentElement = this.elements[this.currentFocus];
    if (currentElement && typeof currentElement.onSelect === 'function') {
      currentElement.onSelect();
    }
  }

  getCurrentElement() {
    if (!this.elements.length) return null;
    return this.elements[this.currentFocus];
  }

  getFocusIndex() {
    return this.currentFocus;
  }
}

export default KeyboardController;