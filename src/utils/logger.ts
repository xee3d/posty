// Production-ready logger with enhanced security and performance
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

interface LogContext {
  userId?: string;
  action?: string;
  component?: string;
  [key: string]: any;
}

class Logger {
  private level: LogLevel = __DEV__ ? 'DEBUG' : 'WARN';
  private isProduction: boolean = !__DEV__;
  private logBuffer: Array<{ timestamp: number; level: LogLevel; message: string; context?: LogContext }> = [];
  private readonly MAX_BUFFER_SIZE = 50;

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private sanitizeData(data: any): any {
    if (typeof data === 'object' && data !== null) {
      // Always sanitize sensitive information
      const sanitized = Array.isArray(data) ? [...data] : { ...data };
      
      const sensitiveKeys = [
        'password', 'token', 'secret', 'key', 'accessToken', 
        'refreshToken', 'idToken', 'apiKey', 'consumerSecret',
        'email', 'phone', 'uid', 'vercelToken', 'authToken'
      ];
      
      const sanitizeObject = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.map(item => this.sanitizeData(item));
        }
        if (typeof obj === 'object' && obj !== null) {
          const result: any = {};
          for (const [key, value] of Object.entries(obj)) {
            if (sensitiveKeys.some(sensitiveKey => 
              key.toLowerCase().includes(sensitiveKey.toLowerCase())
            )) {
              result[key] = '[REDACTED]';
            } else {
              result[key] = this.sanitizeData(value);
            }
          }
          return result;
        }
        return obj;
      };
      
      return sanitizeObject(sanitized);
    }
    return data;
  }

  private addToBuffer(level: LogLevel, message: string, context?: LogContext): void {
    if (this.logBuffer.length >= this.MAX_BUFFER_SIZE) {
      this.logBuffer.shift(); // Remove oldest entry
    }
    this.logBuffer.push({
      timestamp: Date.now(),
      level,
      message,
      context: this.sanitizeData(context)
    });
  }

  debug(message: string, context?: LogContext) {
    if (LOG_LEVELS[this.level] <= LOG_LEVELS.DEBUG) {
      this.addToBuffer('DEBUG', message, context);
      const sanitizedContext = this.sanitizeData(context);
      console.log(`🐛 [DEBUG] ${message}`, sanitizedContext || '');
    }
  }

  info(message: string, context?: LogContext) {
    if (LOG_LEVELS[this.level] <= LOG_LEVELS.INFO) {
      this.addToBuffer('INFO', message, context);
      const sanitizedContext = this.sanitizeData(context);
      console.log(`ℹ️ [INFO] ${message}`, sanitizedContext || '');
    }
  }

  warn(message: string, context?: LogContext) {
    if (LOG_LEVELS[this.level] <= LOG_LEVELS.WARN) {
      this.addToBuffer('WARN', message, context);
      const sanitizedContext = this.sanitizeData(context);
      console.warn(`⚠️ [WARN] ${message}`, sanitizedContext || '');
    }
  }

  error(message: string, context?: LogContext, error?: Error) {
    const errorContext = {
      ...context,
      ...(error && {
        errorMessage: error.message,
        errorStack: __DEV__ ? error.stack : undefined
      })
    };
    
    this.addToBuffer('ERROR', message, errorContext);
    const sanitizedContext = this.sanitizeData(errorContext);
    console.error(`🚨 [ERROR] ${message}`, sanitizedContext || '');
  }

  // Sensitive information logging (development only)
  sensitive(message: string, data: any) {
    if (!this.isProduction) {
      console.log(`🔒 [SENSITIVE] ${message}`, data);
    }
  }

  // Get recent logs for debugging
  getRecentLogs(level?: LogLevel) {
    if (level) {
      return this.logBuffer.filter(log => log.level === level);
    }
    return [...this.logBuffer];
  }

  // Clear log buffer
  clearBuffer() {
    this.logBuffer = [];
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

// Convenience exports
export const logDebug = (message: string, context?: LogContext) => logger.debug(message, context);
export const logInfo = (message: string, context?: LogContext) => logger.info(message, context);
export const logWarn = (message: string, context?: LogContext) => logger.warn(message, context);
export const logError = (message: string, context?: LogContext, error?: Error) => logger.error(message, context, error);

export default logger;