import winston from 'winston';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export class Logger {
  private logger: winston.Logger;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.logger = winston.createLogger({
      level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        // CRITICAL: Only use stderr for MCP servers (stdout is for JSON-RPC)
        new winston.transports.Console({
          stderrLevels: ['error', 'warn', 'info', 'debug'],
        }),
      ],
    });
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(message, meta);
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    this.logger.error(message, { ...meta, error: error?.message, stack: error?.stack });
  }
}

// Singleton instance
const logLevel =
  (process.env.LOG_LEVEL?.toLowerCase() as LogLevel) || LogLevel.INFO;
export const logger = new Logger(logLevel);
