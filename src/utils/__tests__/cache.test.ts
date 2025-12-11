import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TTLCache } from '../cache';

describe('TTLCache', () => {
  let cache: TTLCache<string>;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should create cache with default TTL and maxSize', () => {
      cache = new TTLCache<string>();
      expect(cache).toBeInstanceOf(TTLCache);
      expect(cache.size).toBe(0);
    });

    it('should create cache with custom TTL', () => {
      cache = new TTLCache<string>(60000); // 1 minute
      expect(cache).toBeInstanceOf(TTLCache);
    });

    it('should create cache with custom maxSize', () => {
      cache = new TTLCache<string>(300000, 100);
      expect(cache).toBeInstanceOf(TTLCache);
    });

    it('should create cache with both custom TTL and maxSize', () => {
      cache = new TTLCache<string>(120000, 50);
      expect(cache.size).toBe(0);
    });
  });

  describe('set and get operations', () => {
    beforeEach(() => {
      cache = new TTLCache<string>(5000, 10); // 5 seconds TTL, max 10 items
    });

    it('should set and get a value', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should set multiple values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });

    it('should overwrite existing key', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      expect(cache.get('key1')).toBe('value2');
    });

    it('should return undefined for non-existent key', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should support different value types', () => {
      const objectCache = new TTLCache<{ id: number; name: string }>();
      const value = { id: 1, name: 'test' };
      objectCache.set('obj', value);
      expect(objectCache.get('obj')).toEqual(value);
    });

    it('should support number values', () => {
      const numberCache = new TTLCache<number>();
      numberCache.set('count', 42);
      expect(numberCache.get('count')).toBe(42);
    });

    it('should support array values', () => {
      const arrayCache = new TTLCache<string[]>();
      arrayCache.set('list', ['a', 'b', 'c']);
      expect(arrayCache.get('list')).toEqual(['a', 'b', 'c']);
    });
  });

  describe('TTL expiration', () => {
    beforeEach(() => {
      cache = new TTLCache<string>(5000, 10); // 5 seconds TTL
    });

    it('should return value before TTL expires', () => {
      cache.set('key1', 'value1');
      vi.advanceTimersByTime(4000); // 4 seconds
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return undefined after TTL expires', () => {
      cache.set('key1', 'value1');
      vi.advanceTimersByTime(5001); // Just over 5 seconds
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should delete expired entry on access', () => {
      cache.set('key1', 'value1');
      expect(cache.size).toBe(1);

      vi.advanceTimersByTime(5001);
      cache.get('key1'); // This should trigger deletion

      // Size should still be 0 after cleanup
      expect(cache.size).toBe(0);
    });

    it('should support custom TTL per key', () => {
      cache.set('short', 'value1', 2000); // 2 seconds
      cache.set('long', 'value2', 10000); // 10 seconds

      vi.advanceTimersByTime(3000); // 3 seconds

      expect(cache.get('short')).toBeUndefined(); // Expired
      expect(cache.get('long')).toBe('value2'); // Still valid
    });

    it('should use default TTL when not specified', () => {
      cache.set('key1', 'value1'); // Uses default 5000ms

      vi.advanceTimersByTime(4000);
      expect(cache.get('key1')).toBe('value1');

      vi.advanceTimersByTime(1500);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should handle zero TTL', () => {
      cache.set('key1', 'value1', 0);
      vi.advanceTimersByTime(1);
      expect(cache.get('key1')).toBeUndefined();
    });
  });

  describe('LRU eviction', () => {
    beforeEach(() => {
      cache = new TTLCache<string>(60000, 3); // 3 items max
    });

    it('should evict oldest entry when cache is full', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4'); // This should evict key1

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });

    it('should maintain size limit', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      expect(cache.size).toBe(3);

      cache.set('key4', 'value4');
      expect(cache.size).toBe(3); // Still 3, not 4
    });

    it('should evict multiple entries when adding multiple items', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4');
      cache.set('key5', 'value5');

      expect(cache.size).toBe(3);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
      expect(cache.get('key5')).toBe('value5');
    });

    it('should not evict when under capacity', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      expect(cache.size).toBe(2);
      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
    });
  });

  describe('has', () => {
    beforeEach(() => {
      cache = new TTLCache<string>(5000, 10);
    });

    it('should return true for existing key', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should return false for expired key', () => {
      cache.set('key1', 'value1');
      vi.advanceTimersByTime(5001);
      expect(cache.has('key1')).toBe(false);
    });

    it('should return true for valid non-expired key', () => {
      cache.set('key1', 'value1');
      vi.advanceTimersByTime(4000);
      expect(cache.has('key1')).toBe(true);
    });
  });

  describe('invalidate', () => {
    beforeEach(() => {
      cache = new TTLCache<string>(5000, 10);
    });

    it('should invalidate existing key', () => {
      cache.set('key1', 'value1');
      cache.invalidate('key1');
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should not throw error when invalidating non-existent key', () => {
      expect(() => cache.invalidate('nonexistent')).not.toThrow();
    });

    it('should decrease cache size after invalidation', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size).toBe(2);

      cache.invalidate('key1');
      expect(cache.size).toBe(1);
    });

    it('should invalidate multiple keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      cache.invalidate('key1');
      cache.invalidate('key2');

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBe('value3');
    });
  });

  describe('invalidatePattern', () => {
    beforeEach(() => {
      cache = new TTLCache<string>(5000, 20);
    });

    it('should invalidate keys matching pattern', () => {
      cache.set('user:1', 'value1');
      cache.set('user:2', 'value2');
      cache.set('deal:1', 'value3');

      cache.invalidatePattern(/^user:/);

      expect(cache.get('user:1')).toBeUndefined();
      expect(cache.get('user:2')).toBeUndefined();
      expect(cache.get('deal:1')).toBe('value3');
    });

    it('should invalidate all keys with wildcard pattern', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      cache.invalidatePattern(/.*/);

      expect(cache.size).toBe(0);
    });

    it('should not invalidate keys that do not match pattern', () => {
      cache.set('user:1', 'value1');
      cache.set('user:2', 'value2');
      cache.set('admin:1', 'value3');

      cache.invalidatePattern(/^user:/);

      expect(cache.get('admin:1')).toBe('value3');
      expect(cache.size).toBe(1);
    });

    it('should handle complex regex patterns', () => {
      cache.set('api:v1:users', 'value1');
      cache.set('api:v1:deals', 'value2');
      cache.set('api:v2:users', 'value3');

      cache.invalidatePattern(/^api:v1:/);

      expect(cache.get('api:v1:users')).toBeUndefined();
      expect(cache.get('api:v1:deals')).toBeUndefined();
      expect(cache.get('api:v2:users')).toBe('value3');
    });

    it('should work with empty cache', () => {
      expect(() => cache.invalidatePattern(/^user:/)).not.toThrow();
      expect(cache.size).toBe(0);
    });

    it('should invalidate no keys when pattern matches nothing', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.invalidatePattern(/^nomatch/);

      expect(cache.size).toBe(2);
      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      cache = new TTLCache<string>(5000, 10);
    });

    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      cache.clear();

      expect(cache.size).toBe(0);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBeUndefined();
    });

    it('should work on empty cache', () => {
      expect(() => cache.clear()).not.toThrow();
      expect(cache.size).toBe(0);
    });

    it('should allow adding entries after clear', () => {
      cache.set('key1', 'value1');
      cache.clear();
      cache.set('key2', 'value2');

      expect(cache.get('key2')).toBe('value2');
      expect(cache.size).toBe(1);
    });
  });

  describe('size', () => {
    beforeEach(() => {
      cache = new TTLCache<string>(5000, 10);
    });

    it('should return 0 for empty cache', () => {
      expect(cache.size).toBe(0);
    });

    it('should return correct size after additions', () => {
      cache.set('key1', 'value1');
      expect(cache.size).toBe(1);

      cache.set('key2', 'value2');
      expect(cache.size).toBe(2);
    });

    it('should return correct size after deletions', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.invalidate('key1');

      expect(cache.size).toBe(1);
    });

    it('should return correct size after clear', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();

      expect(cache.size).toBe(0);
    });

    it('should not count expired entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      vi.advanceTimersByTime(5001);

      // Access to trigger cleanup
      cache.get('key1');
      cache.get('key2');

      expect(cache.size).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle very large cache', () => {
      cache = new TTLCache<number>(60000, 1000);

      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, i);
      }

      expect(cache.size).toBe(1000);
      expect(cache.get('key500')).toBe(500);
    });

    it('should handle rapid successive sets', () => {
      cache = new TTLCache<string>(5000, 5);

      for (let i = 0; i < 10; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      expect(cache.size).toBe(5);
    });

    it('should handle concurrent expirations', () => {
      cache = new TTLCache<string>(1000, 10);

      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 1000);
      cache.set('key3', 'value3', 1000);

      vi.advanceTimersByTime(1001);

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBeUndefined();
      expect(cache.size).toBe(0);
    });

    it('should handle string keys with special characters', () => {
      cache = new TTLCache<string>(5000, 10);

      cache.set('key:with:colons', 'value1');
      cache.set('key/with/slashes', 'value2');
      cache.set('key-with-dashes', 'value3');

      expect(cache.get('key:with:colons')).toBe('value1');
      expect(cache.get('key/with/slashes')).toBe('value2');
      expect(cache.get('key-with-dashes')).toBe('value3');
    });

    it('should handle empty string key', () => {
      cache = new TTLCache<string>(5000, 10);

      cache.set('', 'empty key value');
      expect(cache.get('')).toBe('empty key value');
    });
  });
});
