class SpeechHistory {
  constructor(maxSize = 50) {
    this.maxSize = maxSize
    this.history = []
  }

  add(text) {
    if (!text?.trim()) return

    this.history.unshift({
      text,
      timestamp: Date.now()
    })

    if (this.history.length > this.maxSize) {
      this.history.pop()
    }
  }

  getHistory() {
    return this.history
  }

  clear() {
    this.history = []
  }

  getLast() {
    return this.history[0] || null
  }

  format() {
    return this.history
      .map((item) => {
        const date = new Date(item.timestamp)
        return `[${date.toLocaleTimeString()}] ${item.text}`
      })
      .join('\n')
  }
}

export default new SpeechHistory()
