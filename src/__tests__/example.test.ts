import { describe, it, expect, beforeEach } from 'vitest';
import { createMockClient, createMockResponse } from './mocks/client.mock.js';
import { mockDeal, mockPerson, mockOrganization } from './mocks/data.mock.js';
import {
  mockDealResponse,
  mockPersonResponse,
  mockOrganizationResponse,
} from './mocks/responses.mock.js';
import {
  assertSuccessResponse,
  assertValidDeal,
  assertValidPerson,
  assertValidOrganization,
} from './helpers/assertions.js';
import { wait } from './helpers/test-utils.js';

/**
 * Example tests demonstrating how to use the test infrastructure
 * These tests show best practices for testing with the mock system
 */

describe('Example Test Infrastructure Usage', () => {
  describe('Mock Client', () => {
    it('should create a mock client with all methods', () => {
      const client = createMockClient();

      expect(client.get).toBeDefined();
      expect(client.post).toBeDefined();
      expect(client.put).toBeDefined();
      expect(client.delete).toBeDefined();
      expect(client.uploadFile).toBeDefined();
      expect(client.createPaginator).toBeDefined();
      expect(client.clearCache).toBeDefined();
      expect(client.getRateLimiterStats).toBeDefined();
      expect(client.getCacheStats).toBeDefined();
    });

    it('should mock GET requests', async () => {
      const client = createMockClient();
      client.get.mockResolvedValue(mockDealResponse);

      const response = await client.get('/deals/1');

      expect(client.get).toHaveBeenCalledWith('/deals/1');
      assertSuccessResponse(response);
      assertValidDeal(response.data);
    });

    it('should mock POST requests', async () => {
      const client = createMockClient();
      client.post.mockResolvedValue(mockPersonResponse);

      const response = await client.post('/persons', { name: 'Test Person' });

      expect(client.post).toHaveBeenCalledWith('/persons', { name: 'Test Person' });
      assertSuccessResponse(response);
      assertValidPerson(response.data);
    });

    it('should mock PUT requests', async () => {
      const client = createMockClient();
      client.put.mockResolvedValue(mockOrganizationResponse);

      const response = await client.put('/organizations/1', { name: 'Updated Org' });

      expect(client.put).toHaveBeenCalledWith('/organizations/1', {
        name: 'Updated Org',
      });
      assertSuccessResponse(response);
      assertValidOrganization(response.data);
    });

    it('should mock DELETE requests', async () => {
      const client = createMockClient();
      const deleteResponse = createMockResponse({ id: 1, success: true });
      client.delete.mockResolvedValue(deleteResponse);

      const response = await client.delete('/deals/1');

      expect(client.delete).toHaveBeenCalledWith('/deals/1');
      expect(response.success).toBe(true);
    });
  });

  describe('Mock Data', () => {
    it('should provide realistic deal data', () => {
      assertValidDeal(mockDeal);
      expect(mockDeal.title).toBe('Enterprise Software License');
      expect(mockDeal.value).toBe(50000);
      expect(mockDeal.currency).toBe('USD');
    });

    it('should provide realistic person data', () => {
      assertValidPerson(mockPerson);
      expect(mockPerson.name).toBe('Jane Smith');
      expect(mockPerson.email).toHaveLength(2);
      expect(mockPerson.email[0].value).toBe('jane.smith@acme.com');
    });

    it('should provide realistic organization data', () => {
      assertValidOrganization(mockOrganization);
      expect(mockOrganization.name).toBe('Acme Corporation');
      expect(mockOrganization.address).toBe('123 Main Street');
    });
  });

  describe('Mock Responses', () => {
    it('should provide valid response structures', () => {
      assertSuccessResponse(mockDealResponse);
      expect(mockDealResponse.success).toBe(true);
      expect(mockDealResponse.data).toBeDefined();
    });

    it('should handle response data correctly', () => {
      const response = mockPersonResponse;
      assertSuccessResponse(response);
      assertValidPerson(response.data);
    });
  });

  describe('Test Utilities', () => {
    it('should wait for specified time', async () => {
      const startTime = Date.now();
      await wait(100);
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Custom Assertions', () => {
    it('should validate deals', () => {
      assertValidDeal(mockDeal);
    });

    it('should validate persons', () => {
      assertValidPerson(mockPerson);
    });

    it('should validate organizations', () => {
      assertValidOrganization(mockOrganization);
    });

    it('should validate success responses', () => {
      assertSuccessResponse(mockDealResponse);
      assertSuccessResponse(mockPersonResponse);
      assertSuccessResponse(mockOrganizationResponse);
    });
  });

  describe('Test Lifecycle', () => {
    let client: ReturnType<typeof createMockClient>;

    beforeEach(() => {
      client = createMockClient();
    });

    it('should reset mocks between tests', () => {
      expect(client.get).not.toHaveBeenCalled();
    });

    it('should track mock calls', async () => {
      client.get.mockResolvedValue(mockDealResponse);

      await client.get('/deals/1');
      await client.get('/deals/2');

      expect(client.get).toHaveBeenCalledTimes(2);
      expect(client.get).toHaveBeenNthCalledWith(1, '/deals/1');
      expect(client.get).toHaveBeenNthCalledWith(2, '/deals/2');
    });
  });
});
