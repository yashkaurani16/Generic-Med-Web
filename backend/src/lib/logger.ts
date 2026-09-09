export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  correlationId?: string;
  module?: string;
  userId?: string;
  role?: string;
  [key: string]: unknown;
}

class Logger {
  private isDev = process.env.NODE_ENV !== 'production';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const correlationId = context?.correlationId || 'system';
    const moduleTag = context?.module ? `[${context.module}]` : '';

    if (this.isDev) {
      const colors: Record<LogLevel, string> = {
        debug: '\x1b[34m',
        info: '\x1b[32m',
        warn: '\x1b[33m',
        error: '\x1b[31m',
      };
      const reset = '\x1b[0m';
      const color = colors[level] || reset;
      const extra = context ? ` ${JSON.stringify(context)}` : '';
      return `${color}[${level.toUpperCase()}]${reset} ${timestamp} (${correlationId}) ${moduleTag} ${message}${extra}`;
    }

    return JSON.stringify({
      timestamp,
      level,
      correlationId,
      module: context?.module,
      message,
      ...context,
    });
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    const errorDetails = error instanceof Error 
      ? { errorMessage: error.message, stack: error.stack }
      : { errorMessage: String(error) };
    
    console.error(this.formatMessage('error', message, { ...context, ...errorDetails }));
  }
}

export const logger = new Logger();
