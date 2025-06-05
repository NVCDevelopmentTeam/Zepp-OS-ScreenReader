import { log } from '@zos/utils'

class ErrorMonitor {
  constructor() {
    this.errors = []
    this.maxErrors = 100
  }

  trackError(error, context) {
    const errorEntry = {
      timestamp: Date.now(),
      error: error.message || error,
      stack: error.stack,
      context,
      recovered: false
    }
    
    this.errors.unshift(errorEntry)
    if (this.errors.length > this.maxErrors) {
      this.errors.pop()
    }
    
    log.error('[ErrorMonitor]', errorEntry)
    return errorEntry
  }

  markAsRecovered(errorEntry) {
    errorEntry.recovered = true
    errorEntry.recoveryTime = Date.now()
  }

  getErrorStats() {
    return {
      total: this.errors.length,
      recovered: this.errors.filter(e => e.recovered).length,
      recent: this.errors.slice(0, 5)
    }
  }
}

export default new ErrorMonitor()
