// Virtual screen feature in Zepp Os Screen Reader
// This is a placeholder for a virtual screen implementation that works on Zepp OS.
// Browser-based libraries like @guidepup/virtual-screen-reader are not compatible with the device.

class VirtualScreen {
  constructor() {
    this.history = []
    this.virtualTree = []
    this.currentIndex = -1
  }

  async say(text) {
    console.log('[VirtualScreen] say:', text)
    this.history.push({ text, timestamp: Date.now() })
    return true
  }

  async virtualize(elements) {
    this.virtualTree = elements.map((el, index) => ({
      ...el,
      virtualIndex: index
    }))
    this.currentIndex = 0
    return this.virtualTree
  }

  async navigateVirtual(direction) {
    if (this.virtualTree.length === 0) return null

    if (direction === 'next') {
      this.currentIndex = (this.currentIndex + 1) % this.virtualTree.length
    } else {
      this.currentIndex =
        (this.currentIndex - 1 + this.virtualTree.length) % this.virtualTree.length
    }

    return this.virtualTree[this.currentIndex]
  }

  async performOCR(_imageData) {
    // This would call the OCR extension
    console.log('[VirtualScreen] Performing OCR on image data')
    // Placeholder for OCR results
    return [
      { text: 'Virtual Element 1', x: 10, y: 10, w: 100, h: 40 },
      { text: 'Virtual Element 2', x: 10, y: 60, w: 100, h: 40 }
    ]
  }

  clear() {
    this.history = []
    this.virtualTree = []
    this.currentIndex = -1
  }
}

export default new VirtualScreen()
