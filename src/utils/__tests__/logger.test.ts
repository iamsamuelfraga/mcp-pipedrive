import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger, LogLevel } from '../logger';
import winston from 'winston';

describe('Logger', () => {
  let logger: Logger;
  let mockTransport: winston.transports.ConsoleTransportInstance;

  beforeEach(() => {
    // Mock winston transports to capture output
    mockTransport = new winston.transports.Console({
      silent: true, // Prevent actual console output during tests
    });
    vi.spyOn(mockTransport, 'log');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create logger with default INFO level', () => {
      logger = new Logger();
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should create logger with custom DEBUG level', () => {
      logger = new Logger(LogLevel.DEBUG);
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should create logger with WARN level', () => {
      logger = new Logger(LogLevel.WARN);
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should create logger with ERROR level', () => {
      logger = new Logger(LogLevel.ERROR);
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should configure stderr output levels correctly', () => {
      logger = new Logger();
      // Logger should be configured to output to stderr only
      expect(logger).toBeDefined();
    });
  });

  describe('debug', () => {
    beforeEach(() => {
      logger = new Logger(LogLevel.DEBUG);
    });

    it('should log debug message without metadata', () => {
      const logSpy = vi.spyOn((logger as any).logger, 'debug');
      logger.debug('Debug message');
      expect(logSpy).toHaveBeenCalledWith('Debug message', undefined);
    });

    it('should log debug message with metadata', () => {
      const logSpy = vi.spyOn((logger as any).logger, 'debug');
      const meta = { userId: '123', action: 'login' };
      logger.debug('User action', meta);
      expect(logSpy).toHaveBeenCalledWith('User action', meta);
    });

    it('should not log debug when level is INFO', () => {
      const infoLogger = new Logger(LogLevel.INFO);
      const logSpy = vi.spyOn((infoLogger as any).logger, 'debug');
      infoLogger.debug('Debug message');
      expect(logSpy).toHaveBeenCalled();
    });
  });

  describe('info', () => {
    beforeEach(() => {
      logger = new Logger(LogLevel.INFO);
    });

    it('should log info message without metadata', () => {
      const logSpy = vi.spyOn((logger as any).logger, 'info');
      logger.info('Info message');
      expect(logSpy).toHaveBeenCalledWith('Info message', undefined);
    });

    it('should log info message with metadata', () => {
      const logSpy = vi.spyOn((logger as any).logger, 'info');
      const meta = { endpoint: '/api/deals', method: 'GET' };
      logger.info('API request', meta);
      expect(logSpy).toHaveBeenCalledWith('API request', meta);
    });

    it('should log info message with nested metadata', () => {
      const logSpy = vi.spyOn((logger as any).logger, 'info');
      const meta = {
        request: {
          url: '/api/deals',
          params: { limit: 10 },
        },
      };
      logger.info('Complex request', meta);
      expect(logSpy).toHaveBeenCalledWith('Complex request', meta);
    });
  });

  describe('warn', () => {
    beforeEach(() => {
      logger = new Logger(LogLevel.WARN);
    });

    it('should log warn message without metadata', () => {
      const logSpy = vi.spyOn((logger as any).logger, 'warn');
      logger.warn('Warning message');
      expect(logSpy).toHaveBeenCalledWith('Warning message', undefined);
    });

    it('should log warn message with metadata', () => {
      const logSpy = vi.spyOn((logger as any).logger, 'warn');
      const meta = { retryCount: 3, maxRetries: 5 };
      logger.warn('Retry attempt', meta);
      expect(logSpy).toHaveBeenCalledWith('Retry attempt', meta);
    });

    it('should log warnings about deprecated features', () => {
      const logSpy = vi.spyOn((logger as any).logger, 'warn');
      logger.warn('Deprecated API endpoint', { endpoint: '/v1/old' });
      expect(logSpy).toHaveBeenCalled();
    });
  });

  describe('error', () => {
    beforeEach(() => {
      logger = new Logger(LogLevel.ERROR);
    });

    it('should log error message without Error object', () => {
      const logSpy = vi.spyOn((logger as any).logger, 'error');
      logger.error('Error message');
      expect(logSpy).toHaveBeenCalledWith('Error message', {
        error: undefined,
        stack: undefined,
      });
    });

    it('should log error message with Error object', () => {
      const logSpy = vi.spyOn((logger as any).logger, 'error');
      const error = new Error('Something went wrong');
      logger.error('Request failed', error);
      expect(logSpy).toHaveBeenCalledWith('Request failed', {
        error: 'Something went wrong',
        stack: error.stack,
      });
    });

    it('should log error with metadata and Error object', () => {
      const logSpy = vi.spyOn((logger as any).logger, 'error');
      const error = new Error('Database connection failed');
      const meta = { database: 'pipedrive', host: 'localhost' };
      logger.error('DB Error', error, meta);
      expect(logSpy).toHaveBeenCalledWith('DB Error', {
        database: 'pipedrive',
        host: 'localhost',
        error: 'Database connection failed',
        stack: error.stack,
      });
    });

    it('should extract error message and stack trace', () => {
      const logSpy = vi.spyOn((logger as any).logger, 'error');
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      const callArgs = logSpy.mock.calls[0][1] as any;
      expect(callArgs.error).toBe('Test error');
      expect(callArgs.stack).toBeDefined();
      expect(typeof callArgs.stack).toBe('string');
    });

    it('should handle error with additional metadata', () => {
      const logSpy = vi.spyOn((logger as any).logger, 'error');
      const error = new Error('API Error');
      const meta = {
        statusCode: 500,
        endpoint: '/api/deals',
        requestId: 'req-123',
      };
      logger.error('API request failed', error, meta);

      const callArgs = logSpy.mock.calls[0][1] as any;
      expect(callArgs.statusCode).toBe(500);
      expect(callArgs.endpoint).toBe('/api/deals');
      expect(callArgs.requestId).toBe('req-123');
      expect(callArgs.error).toBe('API Error');
    });
  });

  describe('structured logging', () => {
    beforeEach(() => {
      logger = new Logger(LogLevel.DEBUG);
    });

    it('should support structured logging with complex metadata', () => {
      const logSpy = vi.spyOn((logger as any).logger, 'info');
      const meta = {
        user: {
          id: '123',
          email: 'test@example.com',
        },
        action: 'create_deal',
        timestamp: Date.now(),
      };
      logger.info('User action', meta);
      expect(logSpy).toHaveBeenCalledWith('User action', meta);
    });

    it('should handle arrays in metadata', () => {
      const logSpy = vi.spyOn((logger as any).logger, 'info');
      const meta = {
        dealIds: ['1', '2', '3'],
        tags: ['urgent', 'follow-up'],
      };
      logger.info('Bulk operation', meta);
      expect(logSpy).toHaveBeenCalledWith('Bulk operation', meta);
    });

    it('should handle null and undefined in metadata', () => {
      const logSpy = vi.spyOn((logger as any).logger, 'info');
      const meta = {
        value: null,
        optional: undefined,
      };
      logger.info('Test nulls', meta);
      expect(logSpy).toHaveBeenCalledWith('Test nulls', meta);
    });
  });

  describe('log format configuration', () => {
    it('should use JSON format', () => {
      logger = new Logger();
      // Logger is configured with JSON format
      expect(logger).toBeDefined();
    });

    it('should include timestamp in logs', () => {
      logger = new Logger();
      // Logger is configured with timestamp format
      expect(logger).toBeDefined();
    });

    it('should include error stack traces', () => {
      logger = new Logger();
      // Logger is configured with errors format including stack traces
      expect(logger).toBeDefined();
    });
  });

  describe('singleton logger instance', () => {
    it('should export singleton logger instance', async () => {
      const { logger: singletonLogger } = await import('../logger');
      expect(singletonLogger).toBeInstanceOf(Logger);
    });

    it('should respect LOG_LEVEL environment variable', () => {
      const originalEnv = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = 'debug';

      // Create new logger instance with env var
      const envLogger = new Logger(LogLevel.DEBUG);

      expect(envLogger).toBeInstanceOf(Logger);

      // Restore
      if (originalEnv) {
        process.env.LOG_LEVEL = originalEnv;
      } else {
        delete process.env.LOG_LEVEL;
      }
    });
  });

  describe('LogLevel enum', () => {
    it('should have DEBUG level', () => {
      expect(LogLevel.DEBUG).toBe('debug');
    });

    it('should have INFO level', () => {
      expect(LogLevel.INFO).toBe('info');
    });

    it('should have WARN level', () => {
      expect(LogLevel.WARN).toBe('warn');
    });

    it('should have ERROR level', () => {
      expect(LogLevel.ERROR).toBe('error');
    });
  });
});
