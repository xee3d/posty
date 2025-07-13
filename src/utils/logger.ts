// Simple logger utility for React Native
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

class Logger {
  private level: LogLevel = __DEV__ ? 'DEBUG' : 'WARN';

  setLevel(level: LogLevel) {
    this.level = level;
  }

  debug(...args: any[]) {
    if (LOG_LEVELS[this.level] <= LOG_LEVELS.DEBUG) {
      console.log('[DEBUG]', ...args);
    }
  }

  info(...args: any[]) {
    if (LOG_LEVELS[this.level] <= LOG_LEVELS.INFO) {
      console.log('[INFO]', ...args);
    }
  }

  warn(...args: any[]) {
    if (LOG_LEVELS[this.level] <= LOG_LEVELS.WARN) {
      console.warn('[WARN]', ...args);
    }
  }

  error(...args: any[]) {
    if (LOG_LEVELS[this.level] <= LOG_LEVELS.ERROR) {
      console.error('[ERROR]', ...args);
    }
  }

  // Performance logging
  time(label: string) {
    if (__DEV__) {
      console.time(label);
    }
  }

  timeEnd(label: string) {
    if (__DEV__) {
      console.timeEnd(label);
    }
  }
}

const logger = new Logger();

export default logger;