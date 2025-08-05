// 프로덕션 환경을 고려한 안전한 로거
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

class Logger {
  private level: LogLevel = __DEV__ ? 'DEBUG' : 'WARN';
  private isProduction: boolean = !__DEV__;

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private sanitizeData(data: any): any {
    if (this.isProduction && typeof data === 'object' && data !== null) {
      // 프로덕션에서는 민감한 정보 제거
      const sanitized = { ...data };
      
      const sensitiveKeys = [
        'password', 'token', 'secret', 'key', 'accessToken', 
        'refreshToken', 'idToken', 'apiKey', 'consumerSecret',
        'email', 'phone', 'uid', 'vercelToken'
      ];
      
      sensitiveKeys.forEach(key => {
        if (key in sanitized) {
          sanitized[key] = '[REDACTED]';
        }
      });
      
      return sanitized;
    }
    return data;
  }

  debug(...args: any[]) {
    if (LOG_LEVELS[this.level] <= LOG_LEVELS.DEBUG) {
      const sanitizedArgs = args.map(arg => this.sanitizeData(arg));
      console.log('🐛 [DEBUG]', ...sanitizedArgs);
    }
  }

  info(...args: any[]) {
    if (LOG_LEVELS[this.level] <= LOG_LEVELS.INFO) {
      const sanitizedArgs = args.map(arg => this.sanitizeData(arg));
      console.log('ℹ️ [INFO]', ...sanitizedArgs);
    }
  }

  warn(...args: any[]) {
    if (LOG_LEVELS[this.level] <= LOG_LEVELS.WARN) {
      const sanitizedArgs = args.map(arg => this.sanitizeData(arg));
      console.warn('⚠️ [WARN]', ...sanitizedArgs);
    }
  }

  error(...args: any[]) {
    if (LOG_LEVELS[this.level] <= LOG_LEVELS.ERROR) {
      const sanitizedArgs = args.map(arg => this.sanitizeData(arg));
      console.error('🚨 [ERROR]', ...sanitizedArgs);
    }
  }

  // 민감한 정보 로깅용 (개발 환경에서만)
  sensitive(message: string, data: any) {
    if (!this.isProduction) {
      console.log(`🔒 [SENSITIVE] ${message}`, data);
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