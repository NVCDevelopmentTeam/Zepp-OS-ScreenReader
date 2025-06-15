// Virtual screen feature in Zepp Os Screen Reader

class VirtualScreen {
  constructor(width = 80, height = 24) {
    this.width = width;
    this.height = height;
    this.buffer = Array(height).fill().map(() => Array(width).fill(' '));
    this.cursorX = 0;
    this.cursorY = 0;
  }

  clear() {
    this.buffer = Array(this.height).fill().map(() => Array(this.width).fill(' '));
    this.cursorX = 0;
    this.cursorY = 0;
  }

  write(text, x = this.cursorX, y = this.cursorY) {
    if (y < 0 || y >= this.height) return;
    
    const chars = text.split('');
    for (let i = 0; i < chars.length && x + i < this.width; i++) {
      if (x + i >= 0) {
        this.buffer[y][x + i] = chars[i];
      }
    }
    this.cursorX = x + text.length;
    this.cursorY = y;
  }

  getContent() {
    return this.buffer.map(line => line.join('')).join('\n');
  }

  setCursor(x, y) {
    this.cursorX = Math.max(0, Math.min(x, this.width));
    this.cursorY = Math.max(0, Math.min(y, this.height));
  }

  drawBox(x, y, width, height, style = 'single') {
    const chars = style === 'single' 
      ? { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' }
      : { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' };

    this.write(chars.tl + chars.h.repeat(width - 2) + chars.tr, x, y);
    for (let i = 1; i < height - 1; i++) {
      this.write(chars.v, x, y + i);
      this.write(chars.v, x + width - 1, y + i);
    }
    this.write(chars.bl + chars.h.repeat(width - 2) + chars.br, x, y + height - 1);
  }
}

export default VirtualScreen;