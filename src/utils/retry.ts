import { logger } from './logger.js';

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatuses?: number[];
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    retryableStatuses = [408, 429, 500, 502, 503, 504],
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      const isRetryable =
        error instanceof Error &&
        'statusCode' in error &&
        retryableStatuses.includes((error as { statusCode: number }).statusCode);

      if (!isRetryable || attempt === maxRetries) {
        logger.error('Request failed after retries', error as Error, {
          attempt,
          maxRetries,
        });
        throw error;
      }

      logger.warn('Request failed, retrying', {
        attempt: attempt + 1,
        maxRetries: maxRetries + 1,
        delay,
        error: (error as Error).message,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError!;
}
