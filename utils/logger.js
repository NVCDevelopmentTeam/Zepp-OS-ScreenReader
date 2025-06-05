const logger = {
  debug: (message) => {
    if (__DEV__) {
      console.log(`[DEBUG] ${new Date().toISOString()}: ${message}`);
    }
  },
  error: (message, error) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error);
  },
  info: (message) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
  },
  warn: (message) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
  },
  trace: (message) => {
    console.trace(`[TRACE] ${new Date().toISOString()}: ${message}`);
  },
  debugObject: (label, obj) => {
    console.log(`[DEBUG] ${new Date().toISOString()} ${label}:`, JSON.stringify(obj, null, 2));
  }
};

module.exports = logger;
