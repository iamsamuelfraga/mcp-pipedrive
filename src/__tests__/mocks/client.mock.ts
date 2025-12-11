import { vi } from 'vitest';
import type { PipedriveClient, CacheOptions } from '../../pipedrive-client.js';
import type { PaginationHelper } from '../../utils/pagination.js';

/**
 * Creates a mock PipedriveClient instance with all methods mocked
 */
export const createMockClient = () => {
  const mockClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    uploadFile: vi.fn(),
    createPaginator: vi.fn(),
    clearCache: vi.fn(),
    getRateLimiterStats: vi.fn(),
    getCacheStats: vi.fn(),
  };

  return mockClient as unknown as PipedriveClient;
};

/**
 * Creates a mock paginator for testing pagination
 */
export const createMockPaginator = <T>(items: T[] = []) => {
  const paginator = {
    getPage: vi.fn(),
    getAllItems: vi.fn().mockResolvedValue(items),
    hasMore: vi.fn().mockReturnValue(false),
    reset: vi.fn(),
  };

  return paginator as unknown as PaginationHelper<T>;
};

/**
 * Mock response helpers
 */
export const createMockResponse = <T>(data: T, success = true) => ({
  success,
  data,
  additional_data: {},
});

export const createMockPaginatedResponse = <T>(
  data: T[],
  start = 0,
  limit = 50,
  hasMore = false
) => ({
  success: true,
  data,
  additional_data: {
    pagination: {
      start,
      limit,
      more_items_in_collection: hasMore,
      next_start: hasMore ? start + limit : undefined,
    },
  },
});

/**
 * Mock error response
 */
export const createMockErrorResponse = (message = 'API Error', statusCode = 400) => {
  const error = new Error(message) as Error & {
    statusCode?: number;
    endpoint?: string;
  };
  error.statusCode = statusCode;
  return error;
};

/**
 * Helper to setup mock client with common responses
 */
export const setupMockClientWithDefaults = () => {
  const client = createMockClient();

  // Setup default successful responses
  client.get.mockResolvedValue(createMockResponse({}));
  client.post.mockResolvedValue(createMockResponse({}));
  client.put.mockResolvedValue(createMockResponse({}));
  client.delete.mockResolvedValue(createMockResponse({ success: true }));
  client.uploadFile.mockResolvedValue(createMockResponse({}));

  // Setup default stats
  client.getCacheStats.mockReturnValue({ size: 0 });
  client.getRateLimiterStats.mockReturnValue({
    RECEIVED: 0,
    QUEUED: 0,
    RUNNING: 0,
    EXECUTING: 0,
    DONE: 0,
  });

  return client;
};

/**
 * Mock cache options
 */
export const createMockCacheOptions = (enabled = true, ttl = 300000): CacheOptions => ({
  enabled,
  ttl,
});
