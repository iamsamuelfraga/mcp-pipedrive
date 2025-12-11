import { describe, it, expect, beforeEach } from 'vitest';
import { MetricsCollector } from '../metrics';

describe('MetricsCollector', () => {
  let collector: MetricsCollector;

  beforeEach(() => {
    collector = new MetricsCollector();
  });

  describe('constructor', () => {
    it('should create a new metrics collector', () => {
      expect(collector).toBeInstanceOf(MetricsCollector);
    });

    it('should initialize with zero metrics', () => {
      const metrics = collector.getMetrics();

      expect(metrics.requestCount).toBe(0);
      expect(metrics.errorCount).toBe(0);
      expect(metrics.totalDuration).toBe(0);
      expect(metrics.averageDuration).toBe(0);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.requestsByEndpoint).toEqual({});
      expect(metrics.errorsByEndpoint).toEqual({});
    });
  });

  describe('recordRequest', () => {
    it('should record a successful request', () => {
      collector.recordRequest('/api/deals', 100, false);
      const metrics = collector.getMetrics();

      expect(metrics.requestCount).toBe(1);
      expect(metrics.errorCount).toBe(0);
      expect(metrics.totalDuration).toBe(100);
      expect(metrics.requestsByEndpoint['/api/deals']).toBe(1);
    });

    it('should record a failed request', () => {
      collector.recordRequest('/api/deals', 150, true);
      const metrics = collector.getMetrics();

      expect(metrics.requestCount).toBe(1);
      expect(metrics.errorCount).toBe(1);
      expect(metrics.totalDuration).toBe(150);
      expect(metrics.requestsByEndpoint['/api/deals']).toBe(1);
      expect(metrics.errorsByEndpoint['/api/deals']).toBe(1);
    });

    it('should record multiple requests to same endpoint', () => {
      collector.recordRequest('/api/deals', 100);
      collector.recordRequest('/api/deals', 200);
      collector.recordRequest('/api/deals', 300);

      const metrics = collector.getMetrics();

      expect(metrics.requestCount).toBe(3);
      expect(metrics.totalDuration).toBe(600);
      expect(metrics.requestsByEndpoint['/api/deals']).toBe(3);
    });

    it('should record requests to different endpoints', () => {
      collector.recordRequest('/api/deals', 100);
      collector.recordRequest('/api/persons', 150);
      collector.recordRequest('/api/organizations', 200);

      const metrics = collector.getMetrics();

      expect(metrics.requestCount).toBe(3);
      expect(metrics.requestsByEndpoint['/api/deals']).toBe(1);
      expect(metrics.requestsByEndpoint['/api/persons']).toBe(1);
      expect(metrics.requestsByEndpoint['/api/organizations']).toBe(1);
    });

    it('should handle error parameter default', () => {
      collector.recordRequest('/api/deals', 100);
      const metrics = collector.getMetrics();

      expect(metrics.errorCount).toBe(0);
      expect(metrics.errorsByEndpoint).toEqual({});
    });

    it('should accumulate durations', () => {
      collector.recordRequest('/api/deals', 50);
      collector.recordRequest('/api/deals', 100);
      collector.recordRequest('/api/deals', 150);

      const metrics = collector.getMetrics();

      expect(metrics.totalDuration).toBe(300);
    });

    it('should track errors per endpoint', () => {
      collector.recordRequest('/api/deals', 100, true);
      collector.recordRequest('/api/deals', 150, false);
      collector.recordRequest('/api/deals', 200, true);

      const metrics = collector.getMetrics();

      expect(metrics.requestsByEndpoint['/api/deals']).toBe(3);
      expect(metrics.errorsByEndpoint['/api/deals']).toBe(2);
    });

    it('should handle zero duration', () => {
      collector.recordRequest('/api/deals', 0);
      const metrics = collector.getMetrics();

      expect(metrics.totalDuration).toBe(0);
      expect(metrics.requestCount).toBe(1);
    });

    it('should handle very large durations', () => {
      collector.recordRequest('/api/deals', 999999);
      const metrics = collector.getMetrics();

      expect(metrics.totalDuration).toBe(999999);
      expect(metrics.averageDuration).toBe(999999);
    });

    it('should handle decimal durations', () => {
      collector.recordRequest('/api/deals', 123.456);
      const metrics = collector.getMetrics();

      expect(metrics.totalDuration).toBe(123.456);
      expect(metrics.averageDuration).toBe(123.456);
    });
  });

  describe('getMetrics', () => {
    it('should return current metrics snapshot', () => {
      collector.recordRequest('/api/deals', 100);
      collector.recordRequest('/api/persons', 200);

      const metrics = collector.getMetrics();

      expect(metrics).toHaveProperty('requestCount');
      expect(metrics).toHaveProperty('errorCount');
      expect(metrics).toHaveProperty('totalDuration');
      expect(metrics).toHaveProperty('averageDuration');
      expect(metrics).toHaveProperty('errorRate');
      expect(metrics).toHaveProperty('requestsByEndpoint');
      expect(metrics).toHaveProperty('errorsByEndpoint');
    });

    it('should calculate average duration correctly', () => {
      collector.recordRequest('/api/deals', 100);
      collector.recordRequest('/api/deals', 200);
      collector.recordRequest('/api/deals', 300);

      const metrics = collector.getMetrics();

      expect(metrics.averageDuration).toBe(200); // (100 + 200 + 300) / 3
    });

    it('should calculate error rate correctly', () => {
      collector.recordRequest('/api/deals', 100, false);
      collector.recordRequest('/api/deals', 100, true);
      collector.recordRequest('/api/deals', 100, false);
      collector.recordRequest('/api/deals', 100, true);

      const metrics = collector.getMetrics();

      expect(metrics.errorRate).toBe(0.5); // 2 errors / 4 requests
    });

    it('should return 0 average duration when no requests', () => {
      const metrics = collector.getMetrics();

      expect(metrics.averageDuration).toBe(0);
    });

    it('should return 0 error rate when no requests', () => {
      const metrics = collector.getMetrics();

      expect(metrics.errorRate).toBe(0);
    });

    it('should return plain objects for endpoint maps', () => {
      collector.recordRequest('/api/deals', 100);
      const metrics = collector.getMetrics();

      expect(metrics.requestsByEndpoint).toBeTypeOf('object');
      expect(metrics.errorsByEndpoint).toBeTypeOf('object');
      expect(metrics.requestsByEndpoint).not.toBeInstanceOf(Map);
      expect(metrics.errorsByEndpoint).not.toBeInstanceOf(Map);
    });

    it('should include all endpoints in requestsByEndpoint', () => {
      collector.recordRequest('/api/deals', 100);
      collector.recordRequest('/api/persons', 150);
      collector.recordRequest('/api/organizations', 200);
      collector.recordRequest('/api/activities', 250);

      const metrics = collector.getMetrics();

      expect(Object.keys(metrics.requestsByEndpoint)).toHaveLength(4);
      expect(metrics.requestsByEndpoint).toHaveProperty('/api/deals');
      expect(metrics.requestsByEndpoint).toHaveProperty('/api/persons');
      expect(metrics.requestsByEndpoint).toHaveProperty('/api/organizations');
      expect(metrics.requestsByEndpoint).toHaveProperty('/api/activities');
    });

    it('should only include endpoints with errors in errorsByEndpoint', () => {
      collector.recordRequest('/api/deals', 100, true);
      collector.recordRequest('/api/persons', 150, false);
      collector.recordRequest('/api/organizations', 200, true);

      const metrics = collector.getMetrics();

      expect(Object.keys(metrics.errorsByEndpoint)).toHaveLength(2);
      expect(metrics.errorsByEndpoint).toHaveProperty('/api/deals');
      expect(metrics.errorsByEndpoint).toHaveProperty('/api/organizations');
      expect(metrics.errorsByEndpoint).not.toHaveProperty('/api/persons');
    });
  });

  describe('reset', () => {
    it('should reset all metrics to zero', () => {
      collector.recordRequest('/api/deals', 100, false);
      collector.recordRequest('/api/persons', 200, true);
      collector.reset();

      const metrics = collector.getMetrics();

      expect(metrics.requestCount).toBe(0);
      expect(metrics.errorCount).toBe(0);
      expect(metrics.totalDuration).toBe(0);
      expect(metrics.averageDuration).toBe(0);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.requestsByEndpoint).toEqual({});
      expect(metrics.errorsByEndpoint).toEqual({});
    });

    it('should allow recording after reset', () => {
      collector.recordRequest('/api/deals', 100);
      collector.reset();
      collector.recordRequest('/api/deals', 200);

      const metrics = collector.getMetrics();

      expect(metrics.requestCount).toBe(1);
      expect(metrics.totalDuration).toBe(200);
      expect(metrics.requestsByEndpoint['/api/deals']).toBe(1);
    });

    it('should clear endpoint maps', () => {
      collector.recordRequest('/api/deals', 100);
      collector.recordRequest('/api/persons', 150);
      collector.reset();

      const metrics = collector.getMetrics();

      expect(Object.keys(metrics.requestsByEndpoint)).toHaveLength(0);
      expect(Object.keys(metrics.errorsByEndpoint)).toHaveLength(0);
    });

    it('should be callable multiple times', () => {
      collector.recordRequest('/api/deals', 100);
      collector.reset();
      collector.reset();

      const metrics = collector.getMetrics();

      expect(metrics.requestCount).toBe(0);
    });
  });

  describe('error tracking', () => {
    it('should correctly track error count', () => {
      collector.recordRequest('/api/deals', 100, true);
      collector.recordRequest('/api/deals', 100, true);
      collector.recordRequest('/api/deals', 100, true);

      const metrics = collector.getMetrics();

      expect(metrics.errorCount).toBe(3);
    });

    it('should correctly track mixed success and errors', () => {
      collector.recordRequest('/api/deals', 100, false);
      collector.recordRequest('/api/deals', 100, true);
      collector.recordRequest('/api/deals', 100, false);
      collector.recordRequest('/api/deals', 100, true);
      collector.recordRequest('/api/deals', 100, false);

      const metrics = collector.getMetrics();

      expect(metrics.requestCount).toBe(5);
      expect(metrics.errorCount).toBe(2);
      expect(metrics.errorRate).toBe(0.4);
    });

    it('should track errors separately per endpoint', () => {
      collector.recordRequest('/api/deals', 100, true);
      collector.recordRequest('/api/deals', 100, false);
      collector.recordRequest('/api/persons', 100, true);
      collector.recordRequest('/api/persons', 100, true);

      const metrics = collector.getMetrics();

      expect(metrics.errorsByEndpoint['/api/deals']).toBe(1);
      expect(metrics.errorsByEndpoint['/api/persons']).toBe(2);
    });

    it('should handle 100% error rate', () => {
      collector.recordRequest('/api/deals', 100, true);
      collector.recordRequest('/api/deals', 100, true);
      collector.recordRequest('/api/deals', 100, true);

      const metrics = collector.getMetrics();

      expect(metrics.errorRate).toBe(1);
    });

    it('should handle 0% error rate', () => {
      collector.recordRequest('/api/deals', 100, false);
      collector.recordRequest('/api/deals', 100, false);
      collector.recordRequest('/api/deals', 100, false);

      const metrics = collector.getMetrics();

      expect(metrics.errorRate).toBe(0);
    });

    it('should increment error count per endpoint correctly', () => {
      collector.recordRequest('/api/deals', 100, true);
      collector.recordRequest('/api/deals', 100, true);
      collector.recordRequest('/api/deals', 100, true);

      const metrics = collector.getMetrics();

      expect(metrics.errorsByEndpoint['/api/deals']).toBe(3);
    });
  });

  describe('complex scenarios', () => {
    it('should handle mixed operations across multiple endpoints', () => {
      // Deals endpoint
      collector.recordRequest('/api/deals', 100, false);
      collector.recordRequest('/api/deals', 150, true);
      collector.recordRequest('/api/deals', 200, false);

      // Persons endpoint
      collector.recordRequest('/api/persons', 120, false);
      collector.recordRequest('/api/persons', 180, false);

      // Organizations endpoint
      collector.recordRequest('/api/organizations', 90, true);

      const metrics = collector.getMetrics();

      expect(metrics.requestCount).toBe(6);
      expect(metrics.errorCount).toBe(2);
      expect(metrics.totalDuration).toBe(840); // 100+150+200+120+180+90
      expect(metrics.averageDuration).toBe(140); // 840 / 6
      expect(metrics.errorRate).toBeCloseTo(0.333, 2);

      expect(metrics.requestsByEndpoint['/api/deals']).toBe(3);
      expect(metrics.requestsByEndpoint['/api/persons']).toBe(2);
      expect(metrics.requestsByEndpoint['/api/organizations']).toBe(1);

      expect(metrics.errorsByEndpoint['/api/deals']).toBe(1);
      expect(metrics.errorsByEndpoint['/api/organizations']).toBe(1);
      expect(metrics.errorsByEndpoint['/api/persons']).toBeUndefined();
    });

    it('should handle large number of requests', () => {
      for (let i = 0; i < 1000; i++) {
        collector.recordRequest('/api/deals', 100, i % 10 === 0);
      }

      const metrics = collector.getMetrics();

      expect(metrics.requestCount).toBe(1000);
      expect(metrics.errorCount).toBe(100); // Every 10th request
      expect(metrics.totalDuration).toBe(100000);
      expect(metrics.averageDuration).toBe(100);
      expect(metrics.errorRate).toBe(0.1);
    });

    it('should handle varying durations', () => {
      const durations = [10, 50, 100, 200, 500, 1000];

      durations.forEach((duration) => {
        collector.recordRequest('/api/deals', duration);
      });

      const metrics = collector.getMetrics();
      const expectedAvg = durations.reduce((a, b) => a + b, 0) / durations.length;

      expect(metrics.averageDuration).toBe(expectedAvg);
    });

    it('should maintain accuracy with floating point durations', () => {
      collector.recordRequest('/api/deals', 123.456);
      collector.recordRequest('/api/deals', 234.567);
      collector.recordRequest('/api/deals', 345.678);

      const metrics = collector.getMetrics();
      const expectedTotal = 123.456 + 234.567 + 345.678;
      const expectedAvg = expectedTotal / 3;

      expect(metrics.totalDuration).toBeCloseTo(expectedTotal, 3);
      expect(metrics.averageDuration).toBeCloseTo(expectedAvg, 3);
    });

    it('should handle endpoint names with special characters', () => {
      collector.recordRequest('/api/deals:search', 100);
      collector.recordRequest('/api/persons/123/activities', 150);
      collector.recordRequest('/api/organizations?filter=active', 200);

      const metrics = collector.getMetrics();

      expect(metrics.requestsByEndpoint['/api/deals:search']).toBe(1);
      expect(metrics.requestsByEndpoint['/api/persons/123/activities']).toBe(1);
      expect(metrics.requestsByEndpoint['/api/organizations?filter=active']).toBe(1);
    });

    it('should calculate metrics correctly after partial reset scenario', () => {
      collector.recordRequest('/api/deals', 100, false);
      collector.recordRequest('/api/deals', 200, true);

      let metrics = collector.getMetrics();
      expect(metrics.requestCount).toBe(2);
      expect(metrics.errorCount).toBe(1);

      collector.reset();

      collector.recordRequest('/api/deals', 300, false);
      metrics = collector.getMetrics();

      expect(metrics.requestCount).toBe(1);
      expect(metrics.errorCount).toBe(0);
      expect(metrics.totalDuration).toBe(300);
    });
  });

  describe('singleton instance', () => {
    it('should export singleton metrics collector', async () => {
      const { metricsCollector } = await import('../metrics');
      expect(metricsCollector).toBeInstanceOf(MetricsCollector);
    });

    it('should maintain state across imports', async () => {
      const { metricsCollector: collector1 } = await import('../metrics');
      collector1.recordRequest('/api/test', 100);

      const { metricsCollector: collector2 } = await import('../metrics');
      const metrics = collector2.getMetrics();

      // Should be the same instance
      expect(metrics.requestCount).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle negative durations', () => {
      collector.recordRequest('/api/deals', -100);
      const metrics = collector.getMetrics();

      expect(metrics.totalDuration).toBe(-100);
    });

    it('should handle empty endpoint name', () => {
      collector.recordRequest('', 100);
      const metrics = collector.getMetrics();

      expect(metrics.requestsByEndpoint['']).toBe(1);
    });

    it('should handle very long endpoint names', () => {
      const longEndpoint = '/api/' + 'a'.repeat(1000);
      collector.recordRequest(longEndpoint, 100);
      const metrics = collector.getMetrics();

      expect(metrics.requestsByEndpoint[longEndpoint]).toBe(1);
    });

    it('should maintain precision with many small durations', () => {
      for (let i = 0; i < 100; i++) {
        collector.recordRequest('/api/deals', 0.01);
      }

      const metrics = collector.getMetrics();

      expect(metrics.totalDuration).toBeCloseTo(1, 2);
      expect(metrics.averageDuration).toBeCloseTo(0.01, 2);
    });

    it('should handle interleaved success and error patterns', () => {
      const pattern = [false, true, false, false, true, false, true, true];

      pattern.forEach((isError) => {
        collector.recordRequest('/api/deals', 100, isError);
      });

      const metrics = collector.getMetrics();
      const expectedErrors = pattern.filter((e) => e).length;
      const expectedRate = expectedErrors / pattern.length;

      expect(metrics.errorCount).toBe(expectedErrors);
      expect(metrics.errorRate).toBe(expectedRate);
    });
  });
});
