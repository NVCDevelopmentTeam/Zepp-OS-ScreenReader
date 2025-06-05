import { accessibility } from '@zos/accessibility';
import errorMonitor from '../lib/utils/errorMonitor'

Page({
  data: {
    screenReader: false,
    isLoading: false,
    errorMsg: '',
    retryCount: 0,
    timeoutId: null,
    isValid: true,
    validationErrors: [],
    recoveryAttempts: 0,
    maxRecoveryAttempts: 3,
    lastError: null,
    diagnostics: {
      apiCalls: 0,
      failures: 0,
      lastSuccess: null
    }
  },

  onInit() {
    this.initScreenReader();
  },

  validateFeatures() {
    const required = ['screenReader', 'gestures', 'tts']
    const missing = []

    for (const feature of required) {
      try {
        if (!accessibility.isSupported(feature)) {
          missing.push(feature)
        }
      } catch (error) {
        log.error(`Feature check failed: ${feature}`, error)
        missing.push(feature)
      }
    }
    
    if (missing.length) {
      throw new Error(`Missing required features: ${missing.join(', ')}`)
    }
  },

  async initScreenReader() {
    try {
      this.validateFeatures()
      this.setData({ isLoading: true });
      if (this.data.timeoutId) {
        clearTimeout(this.data.timeoutId);
      }
  
      const timeoutId = setTimeout(function() {
        if (this.data.isLoading && this.data.retryCount < 3) {
          this.data.retryCount++;
          this.initScreenReader();
        } else {
          this.setData({
            isLoading: false,
            errorMsg: 'Operation timed out'
          });
        }
      }.bind(this), 5000);
  
      this.setData({ timeoutId });
  
      accessibility.isScreenReaderEnabled({
        complete: function(result) {
          clearTimeout(this.data.timeoutId);
          if (result && typeof result.value === 'boolean') {
            this.setData({ 
              screenReader: Boolean(result.value),
              isLoading: false,
              errorMsg: ''
            });
            this.trackApiCall(true);
          } else {
            this.handleError('Invalid response format');
            this.trackApiCall(false);
          }
        }.bind(this),
        fail: function(error) {
          this.handleError(error);
          this.trackApiCall(false);
        }.bind(this)
      });
    } catch (error) {
      const errorEntry = errorMonitor.trackError(error, {
        operation: 'init',
        retryCount: this.data.retryCount
      })

      if (await this.recoverFromError()) {
        errorMonitor.markAsRecovered(errorEntry)
      }
    }
  },

  handleError(error) {
    console.error('Screen reader error:', error);
    this.setData({
      isLoading: false,
      errorMsg: error && error.toString ? error.toString() : 'Operation failed',
      retryCount: 0,
      lastError: {
        timestamp: Date.now(),
        message: error.toString(),
        type: error.name || 'Unknown'
      }
    });

    if (this.shouldAttemptRecovery(error)) {
      this.recoverFromError();
    }
  },

  validateSettings() {
    const errors = []
    if (!accessibility) {
      errors.push('Accessibility API not available')
    }
    if (!this.checkSystemRequirements()) {
      errors.push('System requirements not met')
    }
    if (!this.validateApiVersion()) {
      errors.push('Incompatible API version')
    }
    
    this.setData({
      isValid: errors.length === 0,
      validationErrors: errors
    })
    return errors.length === 0
  },

  checkSystemRequirements() {
    try {
      // Check Zeus version
      const zeusVersion = process.env.ZEUS_VERSION
      if (!zeusVersion) {
        throw new Error('Zeus environment not detected')
      }

      // Check API compatibility
      const apiVersion = accessibility.getVersion()
      if (!this.isVersionCompatible(apiVersion)) {
        throw new Error(`Incompatible API version: ${apiVersion}`)
      }

      return true
    } catch (error) {
      this.handleError(error)
      return false
    }
  },

  validateApiVersion() {
    try {
      const version = accessibility.getVersion()
      return version >= '1.0.0'
    } catch (error) {
      this.handleError(error)
      return false
    }
  },

  isVersionCompatible(version) {
    const [major, minor] = version.split('.').map(Number)
    return major >= 1 && minor >= 0
  },

  async recoverFromError() {
    if (this.data.recoveryAttempts >= this.data.maxRecoveryAttempts) {
      this.handleError('Max recovery attempts reached')
      return false
    }

    this.setData({
      recoveryAttempts: this.data.recoveryAttempts + 1
    })

    try {
      await this.initScreenReader()
      return true
    } catch (error) {
      this.handleError(error)
      return false
    }
  },

  shouldAttemptRecovery(error) {
    const recoverableErrors = ['TimeoutError', 'NetworkError']
    return recoverableErrors.includes(error.name)
  },

  toggleScreenReader() {
    if (!this.validateSettings()) {
      return
    }

    if (!accessibility || typeof accessibility.setScreenReaderEnabled !== 'function') {
      this.handleError('Screen reader API not available');
      return;
    }

    if (this.data.isLoading) return;
    
    const newValue = !this.data.screenReader;
    this.setData({ 
      isLoading: true,
      retryCount: 0
    });

    if (this.data.timeoutId) {
      clearTimeout(this.data.timeoutId);
    }

    const timeoutId = setTimeout(function() {
      this.handleError('Toggle operation timed out');
      this.trackApiCall(false);
    }.bind(this), 5000);

    this.setData({ timeoutId });
    
    accessibility.setScreenReaderEnabled({
      value: newValue,
      success: function() {
        clearTimeout(this.data.timeoutId);
        this.setData({ 
          screenReader: newValue,
          isLoading: false,
          errorMsg: ''
        });
        this.trackApiCall(true);
      }.bind(this),
      fail: function(error) {
        this.handleError(error);
        this.trackApiCall(false);
      }.bind(this)
    });
  },

  trackApiCall(success) {
    const diagnostics = this.data.diagnostics
    diagnostics.apiCalls++
    if (!success) diagnostics.failures++
    if (success) diagnostics.lastSuccess = Date.now()
    
    this.setData({ diagnostics })
  },

  getDiagnostics() {
    return {
      ...this.data.diagnostics,
      errors: errorMonitor.getErrorStats(),
      successRate: 1 - (this.data.diagnostics.failures / this.data.diagnostics.apiCalls),
      uptime: Date.now() - (this.data.diagnostics.lastSuccess || Date.now())
    }
  },

  onDestroy() {
    if (this.data.timeoutId) {
      clearTimeout(this.data.timeoutId);
    }
    this.setData({
      screenReader: false,
      isLoading: false,
      errorMsg: '',
      recoveryAttempts: 0,
      lastError: null
    });
  }
});
