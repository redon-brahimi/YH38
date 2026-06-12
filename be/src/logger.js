/**
 * A simplified console logger to replace Winston for stability.
 * This removes file-based logging and other complexities.
 * All log messages will be directed to the console.
 */
const logger = {
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  debug: (...args) => console.log('[DEBUG]', ...args),
};

export default logger;