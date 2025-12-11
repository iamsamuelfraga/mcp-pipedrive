import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { getMetricsTool } from '../system/metrics.js';
import { getHealthCheckTool } from '../system/health.js';
import { getResetCacheTool } from '../system/reset-cache.js';

describe('System Tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  describe('system/get_metrics', () => {
    it('should return comprehensive metrics', async () => {
      mockClient.getCacheStats.mockReturnValue({ size: 42 });
      mockClient.getRateLimiterStats.mockReturnValue({
        RECEIVED: 100,
        QUEUED: 5,
        RUNNING: 2,
        EXECUTING: 2,
        DONE: 93,
      });

      // Mock metricsCollector
      vi.mock('../../utils/metrics.js', () => ({
        metricsCollector: {
          getMetrics: () => ({
            requestCount: 100,
            errorCount: 5,
            totalDuration: 50000,
            averageDuration: 500,
            errorRate: 0.05,
            requestsByEndpoint: {
              '/deals': 50,
              '/persons': 30,
              '/activities': 20,
            },
            errorsByEndpoint: {
              '/deals': 2,
              '/persons': 3,
            },
          }),
        },
      }));

      const tools = getMetricsTool(mockClient);
      const tool = tools['system/get_metrics'];
      const result = await tool.handler();

      expect(result).toHaveProperty('cacheStats');
      expect(result).toHaveProperty('rateLimiterStats');
      expect(result).toHaveProperty('timestamp');
      expect(result.cacheStats).toEqual({ size: 42 });
      expect(result.rateLimiterStats.DONE).toBe(93);
    });

    it('should not cache metrics data', async () => {
      mockClient.getCacheStats.mockReturnValue({ size: 10 });
      mockClient.getRateLimiterStats.mockReturnValue({
        RECEIVED: 0,
        QUEUED: 0,
        RUNNING: 0,
        EXECUTING: 0,
        DONE: 0,
      });

      const tools = getMetricsTool(mockClient);
      const tool = tools['system/get_metrics'];

      await tool.handler();
      await tool.handler();

      expect(mockClient.getCacheStats).toHaveBeenCalledTimes(2);
      expect(mockClient.getRateLimiterStats).toHaveBeenCalledTimes(2);
    });

    it('should include timestamp in ISO format', async () => {
      mockClient.getCacheStats.mockReturnValue({ size: 0 });
      mockClient.getRateLimiterStats.mockReturnValue({
        RECEIVED: 0,
        QUEUED: 0,
        RUNNING: 0,
        EXECUTING: 0,
        DONE: 0,
      });

      const tools = getMetricsTool(mockClient);
      const tool = tools['system/get_metrics'];
      const result = await tool.handler();

      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('system/health_check', () => {
    it('should return healthy status', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tools = getHealthCheckTool(mockClient);
      const tool = tools['system/health_check'];
      const result = await tool.handler();

      expect(mockClient.get).toHaveBeenCalledWith('/users/me', undefined, {
        enabled: true,
        ttl: 60000,
      });
      expect(result).toHaveProperty('healthy', true);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('timestamp');
    });

    it('should handle unhealthy status', async () => {
      mockClient.get.mockRejectedValue(new Error('API Error: Service unavailable'));

      const tools = getHealthCheckTool(mockClient);
      const tool = tools['system/health_check'];
      const result = await tool.handler();

      expect(result).toHaveProperty('healthy', false);
      expect(result).toHaveProperty('error', 'API Error: Service unavailable');
      expect(result).toHaveProperty('timestamp');
    });

    it('should use cache with 60 second TTL', async () => {
      const mockResponse = {
        success: true,
        data: { id: 1, name: 'Test User' },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tools = getHealthCheckTool(mockClient);
      const tool = tools['system/health_check'];

      await tool.handler();

      expect(mockClient.get).toHaveBeenCalledWith('/users/me', undefined, {
        enabled: true,
        ttl: 60000,
      });
    });
  });

  describe('system/reset_cache', () => {
    it('should clear the cache', async () => {
      mockClient.getCacheStats.mockReturnValue({ size: 10 });

      const tools = getResetCacheTool(mockClient);
      const tool = tools['system/reset_cache'];
      const result = await tool.handler();

      expect(mockClient.clearCache).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('previousSize', 10);
      expect(result).toHaveProperty('timestamp');
    });

    it('should return success message', async () => {
      mockClient.getCacheStats.mockReturnValue({ size: 5 });

      const tools = getResetCacheTool(mockClient);
      const tool = tools['system/reset_cache'];
      const result = await tool.handler();

      expect(result.message).toContain('Cache');
      expect(result.message).toContain('cleared');
      expect(result.previousSize).toBe(5);
    });

    it('should include timestamp', async () => {
      mockClient.getCacheStats.mockReturnValue({ size: 0 });

      const tools = getResetCacheTool(mockClient);
      const tool = tools['system/reset_cache'];
      const result = await tool.handler();

      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should handle errors gracefully', async () => {
      mockClient.getCacheStats.mockReturnValue({ size: 10 });
      mockClient.clearCache.mockImplementation(() => {
        throw new Error('Cache clear failed');
      });

      const tools = getResetCacheTool(mockClient);
      const tool = tools['system/reset_cache'];

      await expect(tool.handler()).rejects.toThrow('Cache clear failed');
    });
  });

  describe('system integration', () => {
    it('should coordinate cache and metrics', async () => {
      // First, check initial cache size
      mockClient.getCacheStats.mockReturnValue({ size: 10 });

      const metricsTool = getMetricsTool(mockClient);
      const metricsResult = await metricsTool['system/get_metrics'].handler();

      expect(metricsResult.cacheStats.size).toBe(10);

      // Clear cache
      const resetTool = getResetCacheTool(mockClient);
      await resetTool['system/reset_cache'].handler();

      expect(mockClient.clearCache).toHaveBeenCalled();

      // Check cache is cleared
      mockClient.getCacheStats.mockReturnValue({ size: 0 });
      const metricsAfterReset = await metricsTool['system/get_metrics'].handler();

      expect(metricsAfterReset.cacheStats.size).toBe(0);
    });

    it('should verify health before using other operations', async () => {
      const mockHealthResponse = {
        success: true,
        data: { status: 'healthy' },
      };

      mockClient.get.mockResolvedValue(mockHealthResponse);

      const healthTool = getHealthCheckTool(mockClient);
      const healthResult = await healthTool['system/health_check'].handler();

      expect(healthResult.healthy).toBe(true);

      // If healthy, proceed with other operations
      if (healthResult.healthy) {
        const metricsTool = getMetricsTool(mockClient);
        await metricsTool['system/get_metrics'].handler();

        expect(mockClient.getCacheStats).toHaveBeenCalled();
      }
    });
  });
});
