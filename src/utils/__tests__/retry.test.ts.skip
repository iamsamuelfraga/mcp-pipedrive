import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry, RetryOptions } from '../retry';

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('successful execution', () => {
    it('should execute function successfully on first attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const promise = withRetry(mockFn);

      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should return function result', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'test', status: 200 });
      const promise = withRetry(mockFn);

      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toEqual({ data: 'test', status: 200 });
    });

    it('should work with different return types', async () => {
      const numberFn = vi.fn().mockResolvedValue(42);
      const stringFn = vi.fn().mockResolvedValue('result');
      const arrayFn = vi.fn().mockResolvedValue([1, 2, 3]);

      await vi.runAllTimersAsync();

      expect(await withRetry(numberFn)).toBe(42);
      expect(await withRetry(stringFn)).toBe('result');
      expect(await withRetry(arrayFn)).toEqual([1, 2, 3]);
    });
  });

  describe('retry on retryable errors', () => {
    it('should retry on 429 rate limit error', async () => {
      const error = Object.assign(new Error('Rate limited'), {
        statusCode: 429,
      });

      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        if (attempts === 1) {
          throw error;
        }
        return 'success after retry';
      });

      const promise = withRetry(mockFn);

      // First attempt
      await vi.runAllTimersAsync();

      // Wait for retry delay
      await vi.advanceTimersByTimeAsync(1000);
      await vi.runAllTimersAsync();

      const result = await promise;

      expect(result).toBe('success after retry');
      expect(attempts).toBe(2);
    });

    it('should retry on 500 server error', async () => {
      const error = Object.assign(new Error('Server error'), {
        statusCode: 500,
      });

      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        if (attempts < 2) {
          throw error;
        }
        return 'success';
      });

      const promise = withRetry(mockFn);

      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(1000);
      await vi.runAllTimersAsync();

      const result = await promise;

      expect(result).toBe('success');
      expect(attempts).toBe(2);
    });

    it('should retry on 502 bad gateway', async () => {
      const error = Object.assign(new Error('Bad gateway'), {
        statusCode: 502,
      });

      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        if (attempts === 1) {
          throw error;
        }
        return 'success';
      });

      const promise = withRetry(mockFn);

      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(1000);
      await vi.runAllTimersAsync();

      await promise;

      expect(attempts).toBe(2);
    });

    it('should retry on 503 service unavailable', async () => {
      const error = Object.assign(new Error('Service unavailable'), {
        statusCode: 503,
      });

      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        if (attempts === 1) {
          throw error;
        }
        return 'success';
      });

      const promise = withRetry(mockFn);

      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(1000);
      await vi.runAllTimersAsync();

      await promise;

      expect(attempts).toBe(2);
    });

    it('should retry on 504 gateway timeout', async () => {
      const error = Object.assign(new Error('Gateway timeout'), {
        statusCode: 504,
      });

      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        if (attempts === 1) {
          throw error;
        }
        return 'success';
      });

      const promise = withRetry(mockFn);

      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(1000);
      await vi.runAllTimersAsync();

      await promise;

      expect(attempts).toBe(2);
    });

    it('should retry on 408 request timeout', async () => {
      const error = Object.assign(new Error('Request timeout'), {
        statusCode: 408,
      });

      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        if (attempts === 1) {
          throw error;
        }
        return 'success';
      });

      const promise = withRetry(mockFn);

      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(1000);
      await vi.runAllTimersAsync();

      await promise;

      expect(attempts).toBe(2);
    });
  });

  describe('no retry on non-retryable errors', () => {
    it('should not retry on 400 bad request', async () => {
      const error = Object.assign(new Error('Bad request'), {
        statusCode: 400,
      });

      const mockFn = vi.fn().mockRejectedValue(error);

      await expect(withRetry(mockFn)).rejects.toThrow('Bad request');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should not retry on 401 unauthorized', async () => {
      const error = Object.assign(new Error('Unauthorized'), {
        statusCode: 401,
      });

      const mockFn = vi.fn().mockRejectedValue(error);

      await expect(withRetry(mockFn)).rejects.toThrow('Unauthorized');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should not retry on 404 not found', async () => {
      const error = Object.assign(new Error('Not found'), {
        statusCode: 404,
      });

      const mockFn = vi.fn().mockRejectedValue(error);

      await expect(withRetry(mockFn)).rejects.toThrow('Not found');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should not retry on errors without statusCode', async () => {
      const error = new Error('Generic error');
      const mockFn = vi.fn().mockRejectedValue(error);

      await expect(withRetry(mockFn)).rejects.toThrow('Generic error');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('exponential backoff', () => {
    it('should use exponential backoff between retries', async () => {
      const error = Object.assign(new Error('Server error'), {
        statusCode: 500,
      });

      let attempts = 0;
      const delays: number[] = [];
      let lastTime = Date.now();

      const mockFn = vi.fn(async () => {
        if (attempts > 0) {
          delays.push(Date.now() - lastTime);
        }
        lastTime = Date.now();
        attempts++;

        if (attempts <= 3) {
          throw error;
        }
        return 'success';
      });

      const options: RetryOptions = {
        maxRetries: 3,
        initialDelay: 1000,
        backoffMultiplier: 2,
      };

      const promise = withRetry(mockFn, options);

      // First attempt
      await vi.runAllTimersAsync();

      // First retry after 1000ms
      await vi.advanceTimersByTimeAsync(1000);
      await vi.runAllTimersAsync();

      // Second retry after 2000ms
      await vi.advanceTimersByTimeAsync(2000);
      await vi.runAllTimersAsync();

      // Third retry after 4000ms
      await vi.advanceTimersByTimeAsync(4000);
      await vi.runAllTimersAsync();

      await promise;

      expect(attempts).toBe(4);
      expect(delays[0]).toBeGreaterThanOrEqual(1000);
      expect(delays[1]).toBeGreaterThanOrEqual(2000);
      expect(delays[2]).toBeGreaterThanOrEqual(4000);
    });

    it('should respect custom backoff multiplier', async () => {
      const error = Object.assign(new Error('Server error'), {
        statusCode: 500,
      });

      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        if (attempts <= 2) {
          throw error;
        }
        return 'success';
      });

      const options: RetryOptions = {
        maxRetries: 2,
        initialDelay: 100,
        backoffMultiplier: 3,
      };

      const promise = withRetry(mockFn, options);

      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(100); // First retry
      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(300); // Second retry (100 * 3)
      await vi.runAllTimersAsync();

      await promise;

      expect(attempts).toBe(3);
    });

    it('should cap delay at maxDelay', async () => {
      const error = Object.assign(new Error('Server error'), {
        statusCode: 500,
      });

      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        if (attempts <= 3) {
          throw error;
        }
        return 'success';
      });

      const options: RetryOptions = {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 2000,
        backoffMultiplier: 10,
      };

      const promise = withRetry(mockFn, options);

      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(1000); // First retry: 1000ms
      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(2000); // Second retry: capped at 2000ms
      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(2000); // Third retry: capped at 2000ms
      await vi.runAllTimersAsync();

      await promise;

      expect(attempts).toBe(4);
    });

    it('should use custom initial delay', async () => {
      const error = Object.assign(new Error('Server error'), {
        statusCode: 500,
      });

      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        if (attempts === 1) {
          throw error;
        }
        return 'success';
      });

      const options: RetryOptions = {
        initialDelay: 5000,
      };

      const promise = withRetry(mockFn, options);

      // First attempt
      await vi.runAllTimersAsync();

      // Should wait 5000ms before retry
      await vi.advanceTimersByTimeAsync(5000);
      await vi.runAllTimersAsync();

      const result = await promise;

      expect(result).toBe('success');
      expect(attempts).toBe(2);
    });
  });

  describe('max retries', () => {
    it('should stop after max retries', async () => {
      const error = Object.assign(new Error('Server error'), {
        statusCode: 500,
      });

      const mockFn = vi.fn().mockRejectedValue(error);

      const options: RetryOptions = {
        maxRetries: 3,
        initialDelay: 100,
      };

      const promise = withRetry(mockFn, options);

      await vi.runAllTimersAsync();

      // Retry 1
      await vi.advanceTimersByTimeAsync(100);
      await vi.runAllTimersAsync();

      // Retry 2
      await vi.advanceTimersByTimeAsync(200);
      await vi.runAllTimersAsync();

      // Retry 3
      await vi.advanceTimersByTimeAsync(400);
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('Server error');
      expect(mockFn).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it('should respect custom maxRetries', async () => {
      const error = Object.assign(new Error('Server error'), {
        statusCode: 500,
      });

      const mockFn = vi.fn().mockRejectedValue(error);

      const options: RetryOptions = {
        maxRetries: 5,
        initialDelay: 10,
      };

      const promise = withRetry(mockFn, options);

      await vi.runAllTimersAsync();

      for (let i = 0; i < 5; i++) {
        await vi.advanceTimersByTimeAsync(10 * Math.pow(2, i));
        await vi.runAllTimersAsync();
      }

      await expect(promise).rejects.toThrow('Server error');
      expect(mockFn).toHaveBeenCalledTimes(6); // Initial + 5 retries
    });

    it('should not retry beyond maxRetries even if error is retryable', async () => {
      const error = Object.assign(new Error('Server error'), {
        statusCode: 500,
      });

      const mockFn = vi.fn().mockRejectedValue(error);

      const options: RetryOptions = {
        maxRetries: 2,
        initialDelay: 100,
      };

      const promise = withRetry(mockFn, options);

      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(100);
      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(200);
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('Server error');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should handle maxRetries of 0', async () => {
      const error = Object.assign(new Error('Server error'), {
        statusCode: 500,
      });

      const mockFn = vi.fn().mockRejectedValue(error);

      const options: RetryOptions = {
        maxRetries: 0,
      };

      await expect(withRetry(mockFn, options)).rejects.toThrow('Server error');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('custom retryable statuses', () => {
    it('should use custom retryable status codes', async () => {
      const error = Object.assign(new Error('Custom error'), {
        statusCode: 418, // I'm a teapot
      });

      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        if (attempts === 1) {
          throw error;
        }
        return 'success';
      });

      const options: RetryOptions = {
        retryableStatuses: [418],
        initialDelay: 100,
      };

      const promise = withRetry(mockFn, options);

      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(100);
      await vi.runAllTimersAsync();

      await promise;

      expect(attempts).toBe(2);
    });

    it('should not retry status codes not in custom list', async () => {
      const error = Object.assign(new Error('Server error'), {
        statusCode: 500,
      });

      const mockFn = vi.fn().mockRejectedValue(error);

      const options: RetryOptions = {
        retryableStatuses: [429], // Only retry 429
      };

      await expect(withRetry(mockFn, options)).rejects.toThrow('Server error');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle empty retryable statuses array', async () => {
      const error = Object.assign(new Error('Server error'), {
        statusCode: 500,
      });

      const mockFn = vi.fn().mockRejectedValue(error);

      const options: RetryOptions = {
        retryableStatuses: [],
      };

      await expect(withRetry(mockFn, options)).rejects.toThrow('Server error');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('final failure', () => {
    it('should throw last error after all retries exhausted', async () => {
      const error = Object.assign(new Error('Persistent error'), {
        statusCode: 500,
      });

      const mockFn = vi.fn().mockRejectedValue(error);

      const options: RetryOptions = {
        maxRetries: 2,
        initialDelay: 10,
      };

      const promise = withRetry(mockFn, options);

      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(10);
      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(20);
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('Persistent error');
    });

    it('should preserve error properties', async () => {
      const error = Object.assign(new Error('Custom error'), {
        statusCode: 500,
        customProp: 'custom value',
      });

      const mockFn = vi.fn().mockRejectedValue(error);

      const options: RetryOptions = {
        maxRetries: 1,
        initialDelay: 10,
      };

      const promise = withRetry(mockFn, options);

      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(10);
      await vi.runAllTimersAsync();

      try {
        await promise;
        expect.fail('Should have thrown');
      } catch (e: any) {
        expect(e.message).toBe('Custom error');
        expect(e.statusCode).toBe(500);
        expect(e.customProp).toBe('custom value');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle successful retry after multiple failures', async () => {
      const error = Object.assign(new Error('Temporary error'), {
        statusCode: 503,
      });

      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        if (attempts <= 3) {
          throw error;
        }
        return 'finally succeeded';
      });

      const options: RetryOptions = {
        maxRetries: 3,
        initialDelay: 10,
      };

      const promise = withRetry(mockFn, options);

      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(10);
      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(20);
      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(40);
      await vi.runAllTimersAsync();

      const result = await promise;

      expect(result).toBe('finally succeeded');
      expect(attempts).toBe(4);
    });

    it('should handle function that returns falsy values', async () => {
      const mockFn = vi.fn().mockResolvedValue(0);
      const promise = withRetry(mockFn);

      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe(0);
    });

    it('should handle function that returns null', async () => {
      const mockFn = vi.fn().mockResolvedValue(null);
      const promise = withRetry(mockFn);

      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe(null);
    });

    it('should handle function that returns undefined', async () => {
      const mockFn = vi.fn().mockResolvedValue(undefined);
      const promise = withRetry(mockFn);

      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe(undefined);
    });

    it('should handle very long retry sequences', async () => {
      const error = Object.assign(new Error('Error'), {
        statusCode: 500,
      });

      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        if (attempts <= 5) {
          throw error;
        }
        return 'success';
      });

      const options: RetryOptions = {
        maxRetries: 10,
        initialDelay: 10,
        maxDelay: 50,
      };

      const promise = withRetry(mockFn, options);

      await vi.runAllTimersAsync();

      for (let i = 0; i < 6; i++) {
        await vi.advanceTimersByTimeAsync(100);
        await vi.runAllTimersAsync();
      }

      const result = await promise;

      expect(result).toBe('success');
      expect(attempts).toBe(6);
    });
  });

  describe('default options', () => {
    it('should use default maxRetries of 3', async () => {
      const error = Object.assign(new Error('Error'), {
        statusCode: 500,
      });

      const mockFn = vi.fn().mockRejectedValue(error);

      const promise = withRetry(mockFn);

      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(1000);
      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(2000);
      await vi.runAllTimersAsync();
      await vi.advanceTimersByTimeAsync(4000);
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow();
      expect(mockFn).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it('should use default initialDelay of 1000ms', async () => {
      const error = Object.assign(new Error('Error'), {
        statusCode: 500,
      });

      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        if (attempts === 1) {
          throw error;
        }
        return 'success';
      });

      const promise = withRetry(mockFn);

      // First attempt
      await vi.runAllTimersAsync();

      // Should wait 1000ms before retry
      await vi.advanceTimersByTimeAsync(1000);
      await vi.runAllTimersAsync();

      const result = await promise;

      expect(result).toBe('success');
      expect(attempts).toBe(2);
    });

    it('should use default maxDelay of 10000ms', async () => {
      const error = Object.assign(new Error('Error'), {
        statusCode: 500,
      });

      let attempts = 0;
      const mockFn = vi.fn(async () => {
        attempts++;
        if (attempts <= 10) {
          throw error;
        }
        return 'success';
      });

      const options: RetryOptions = {
        maxRetries: 10,
        initialDelay: 1000,
        backoffMultiplier: 100, // Very high multiplier
        // maxDelay defaults to 10000
      };

      const promise = withRetry(mockFn, options);

      await vi.runAllTimersAsync();

      // Even with high multiplier, should not exceed 10000ms
      for (let i = 0; i < 11; i++) {
        await vi.advanceTimersByTimeAsync(10000);
        await vi.runAllTimersAsync();
      }

      const result = await promise;

      expect(result).toBe('success');
    });
  });
});
