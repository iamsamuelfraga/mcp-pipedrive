import Bottleneck from 'bottleneck';
import { logger } from './logger.js';

export interface RateLimiterConfig {
  minTime?: number; // Min time between requests (ms)
  maxConcurrent?: number; // Max concurrent requests
  reservoir?: number; // Tokens in bucket
  reservoirRefreshAmount?: number;
  reservoirRefreshInterval?: number; // ms
}

export class RateLimiter {
  private limiter: Bottleneck;

  constructor(config: RateLimiterConfig = {}) {
    this.limiter = new Bottleneck({
      minTime: config.minTime ?? 100, // Default: 10 req/sec
      maxConcurrent: config.maxConcurrent ?? 5,
      reservoir: config.reservoir ?? 100, // Start with 100 tokens
      reservoirRefreshAmount: config.reservoirRefreshAmount ?? 100,
      reservoirRefreshInterval: config.reservoirRefreshInterval ?? 60000, // Refill every minute
    });

    // Event listeners for monitoring
    this.limiter.on('failed', async (error, jobInfo) => {
      const statusCode = (error as any).statusCode;

      if (statusCode === 429) {
        logger.warn('Rate limit hit, will retry', {
          jobId: jobInfo.options.id,
          retryCount: jobInfo.retryCount,
        });
        return 5000; // Retry after 5 seconds
      }

      return undefined; // Don't retry for other errors
    });

    this.limiter.on('error', (error) => {
      logger.error('Rate limiter error', error as Error);
    });

    this.limiter.on('depleted', () => {
      logger.warn('Rate limit reservoir depleted');
    });
  }

  async schedule<T>(fn: () => Promise<T>): Promise<T> {
    return this.limiter.schedule(fn);
  }

  get counts() {
    return this.limiter.counts();
  }

  async stop(): Promise<void> {
    await this.limiter.stop();
  }
}
