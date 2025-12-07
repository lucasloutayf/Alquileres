/**
 * Logger utility that only logs in development mode
 * In production, logs are suppressed to avoid exposing sensitive information
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    if (isDev) {
      console.error(...args);
    }
  },
  
  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (isDev) {
      console.info(...args);
    }
  },

  // For critical errors that should always be logged (even in production)
  // but without sensitive details
  critical: (message, error = null) => {
    if (isDev && error) {
      console.error(message, error);
    } else {
      console.error(message);
    }
  }
};

export default logger;
