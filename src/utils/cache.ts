import { logger } from './logger.js';

interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

export class TTLCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private defaultTTL: number;
  private maxSize: number;

  constructor(defaultTTL: number = 300000, maxSize: number = 500) {
    this.defaultTTL = defaultTTL; // 5 minutes default
    this.maxSize = maxSize;
  }

  set(key: string, value: T, ttl?: number): void {
    // LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        logger.debug('Cache evicted oldest entry', { key: firstKey });
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttl ?? this.defaultTTL),
    });

    logger.debug('Cache set', { key, ttl: ttl ?? this.defaultTTL });
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) {
      logger.debug('Cache miss', { key });
      return undefined;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      logger.debug('Cache expired', { key });
      return undefined;
    }

    logger.debug('Cache hit', { key });
    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    logger.debug('Cache invalidated', { key });
  }

  clear(): void {
    this.cache.clear();
    logger.debug('Cache cleared');
  }

  invalidatePattern(pattern: RegExp): void {
    let count = 0;
    for (const key of Array.from(this.cache.keys())) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    logger.debug('Cache pattern invalidated', { pattern: pattern.toString(), count });
  }

  get size(): number {
    return this.cache.size;
  }
}
