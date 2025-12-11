import { RateLimiter } from './utils/rate-limiter.js';
import { TTLCache } from './utils/cache.js';
import { withRetry } from './utils/retry.js';
import { logger } from './utils/logger.js';
import { metricsCollector } from './utils/metrics.js';
import { PipedriveError } from './utils/error-handler.js';
import { PaginationHelper, type PaginatedResponse } from './utils/pagination.js';

export interface CacheOptions {
  enabled?: boolean;
  ttl?: number;
}

export class PipedriveClient {
  private apiToken: string;
  private baseUrl = 'https://api.pipedrive.com/v1';
  private rateLimiter: RateLimiter;
  private cache: TTLCache<unknown>;

  constructor(apiToken: string) {
    this.apiToken = apiToken;

    // Configure rate limiter (Pipedrive default: 10 req/s)
    this.rateLimiter = new RateLimiter({
      minTime: 100, // Max 10 req/sec
      maxConcurrent: 5,
      reservoir: 100, // Burst capacity
      reservoirRefreshAmount: 100,
      reservoirRefreshInterval: 60000, // Refill every minute
    });

    // Configure cache
    this.cache = new TTLCache(300000, 500); // 5 min default TTL, max 500 items

    logger.info('PipedriveClient initialized', {
      baseUrl: this.baseUrl,
    });
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    cacheOptions?: CacheOptions
  ): Promise<T> {
    const cacheKey = `GET:${endpoint}:${JSON.stringify(params || {})}`;

    // Check cache if enabled
    if (cacheOptions?.enabled) {
      const cached = this.cache.get(cacheKey) as T | undefined;
      if (cached) {
        logger.debug('Cache hit', { endpoint, cacheKey });
        return cached;
      }
    }

    const result = await this.request<T>('GET', endpoint, undefined, params);

    // Save to cache if enabled
    if (cacheOptions?.enabled) {
      this.cache.set(cacheKey, result, cacheOptions.ttl);
    }

    return result;
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    const result = await this.request<T>('POST', endpoint, body, params);

    // Invalidate related cache entries
    this.invalidateCachePattern(endpoint);

    return result;
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    const result = await this.request<T>('PUT', endpoint, body, params);

    // Invalidate related cache entries
    this.invalidateCachePattern(endpoint);

    return result;
  }

  async delete<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    const result = await this.request<T>('DELETE', endpoint, undefined, params);

    // Invalidate related cache entries
    this.invalidateCachePattern(endpoint);

    return result;
  }

  async uploadFile(
    endpoint: string,
    file: Buffer,
    filename: string,
    additionalFields?: Record<string, string | number>
  ): Promise<unknown> {
    const formData = new FormData();
    const blob = new Blob([file]);
    formData.append('file', blob, filename);

    // Add additional fields
    if (additionalFields) {
      for (const [key, value] of Object.entries(additionalFields)) {
        formData.append(key, String(value));
      }
    }

    const url = `${this.baseUrl}${endpoint}`;
    const requestId = Math.random().toString(36).substring(7);
    const startTime = Date.now();

    logger.debug('File upload started', { requestId, endpoint, filename });

    try {
      const response = await this.rateLimiter.schedule(async () => {
        return fetch(url, {
          method: 'POST',
          headers: {
            'x-api-token': this.apiToken,
          },
          body: formData,
        });
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('File upload failed', undefined, {
          requestId,
          endpoint,
          status: response.status,
          error: errorText,
        });

        metricsCollector.recordRequest(endpoint, duration, true);

        throw new PipedriveError(
          `Pipedrive API error (${response.status}): ${errorText}`,
          response.status,
          endpoint
        );
      }

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      logger.info('File upload completed', {
        requestId,
        endpoint,
        status: response.status,
        duration,
      });

      metricsCollector.recordRequest(endpoint, duration, false);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('File upload error', error as Error, { requestId, endpoint });
      metricsCollector.recordRequest(endpoint, duration, true);
      throw error;
    }
  }

  createPaginator<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): PaginationHelper<T> {
    return new PaginationHelper<T>(async (start, limit) => {
      return this.get<PaginatedResponse<T>>(endpoint, {
        ...params,
        start,
        limit,
      });
    });
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Add query parameters
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, String(value));
      }
    }

    const requestId = Math.random().toString(36).substring(7);
    const startTime = Date.now();

    logger.debug('Request started', {
      requestId,
      method,
      endpoint,
      params,
    });

    try {
      const result = await withRetry(
        async () => {
          return this.rateLimiter.schedule(async () => {
            const response = await fetch(url.toString(), {
              method,
              headers: {
                'x-api-token': this.apiToken,
                'Content-Type': 'application/json',
              },
              body: body ? JSON.stringify(body) : undefined,
            });

            // Check rate limit headers
            const remaining = response.headers.get('X-RateLimit-Remaining');
            const reset = response.headers.get('X-RateLimit-Reset');

            if (remaining && parseInt(remaining) < 10) {
              logger.warn('Rate limit warning', {
                remaining,
                reset,
                endpoint,
              });
            }

            if (!response.ok) {
              const errorText = await response.text();
              const error = new PipedriveError(
                `Pipedrive API error (${response.status}): ${errorText}`,
                response.status,
                endpoint
              );
              (error as any).statusCode = response.status;
              throw error;
            }

            const text = await response.text();
            return text ? JSON.parse(text) : {};
          });
        },
        {
          maxRetries: 3,
          retryableStatuses: [408, 429, 500, 502, 503, 504],
        }
      );

      const duration = Date.now() - startTime;

      logger.info('Request completed', {
        requestId,
        method,
        endpoint,
        status: 200,
        duration,
      });

      metricsCollector.recordRequest(endpoint, duration, false);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Request failed', error as Error, {
        requestId,
        method,
        endpoint,
        duration,
      });

      metricsCollector.recordRequest(endpoint, duration, true);

      throw error;
    }
  }

  private invalidateCachePattern(endpoint: string): void {
    // Extract base resource from endpoint (e.g., "/deals/123" -> "deals")
    const resource = endpoint.split('/')[1];
    const pattern = new RegExp(`^GET:/${resource}`);
    this.cache.invalidatePattern(pattern);
    logger.debug('Cache invalidated for pattern', { pattern: pattern.toString() });
  }

  getCacheStats() {
    return {
      size: this.cache.size,
    };
  }

  getRateLimiterStats() {
    return this.rateLimiter.counts;
  }

  clearCache(): void {
    this.cache.clear();
    logger.info('Cache cleared manually');
  }
}
