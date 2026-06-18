class SpeechHistory {
  constructor(maxSize = 50) {
    this.maxSize = maxSize
    this.history = []
  }

  add(text) {
    if (!text?.trim()) return

    const now = Date.now()
    const previous = this.history[0]
    // Coalesce the same announcement arriving within a short window so the
    // history isn't flooded with duplicates from focus/TTS retries.
    if (previous && previous.text === text && now - previous.timestamp < 1000) {
      previous.timestamp = now
      previous.count = (previous.count || 1) + 1
      return
    }

    this.history.unshift({ text, timestamp: now, count: 1 })

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
