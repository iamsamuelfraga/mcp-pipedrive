import { vi } from 'vitest';
import type { PipedriveClient } from '../../../pipedrive-client.js';

/**
 * Creates a mocked PipedriveClient for testing
 */
export function createMockClient(): jest.Mocked<PipedriveClient> {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    uploadFile: vi.fn(),
    createPaginator: vi.fn(),
    getCacheStats: vi.fn().mockReturnValue({ size: 0 }),
    getRateLimiterStats: vi.fn().mockReturnValue({ RECEIVED: 0, QUEUED: 0, RUNNING: 0, EXECUTING: 0, DONE: 0 }),
    clearCache: vi.fn(),
  } as unknown as jest.Mocked<PipedriveClient>;
}
