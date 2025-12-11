import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { getUniversalSearchTool } from '../search/universal.js';
import { getSearchByFieldTool } from '../search/by-field.js';

describe('Search Tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  describe('search/universal', () => {
    it('should search across all entities', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              item: {
                id: 1,
                type: 'deal',
                title: 'Acme Deal',
              },
              result_score: 0.95,
            },
            {
              item: {
                id: 2,
                type: 'person',
                name: 'John Acme',
              },
              result_score: 0.87,
            },
            {
              item: {
                id: 3,
                type: 'organization',
                name: 'Acme Corp',
              },
              result_score: 0.92,
            },
          ],
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tools = getUniversalSearchTool(mockClient);
      const tool = tools['search/universal'];
      const result = await tool.handler({ term: 'acme' });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/itemSearch',
        {
          term: 'acme',
          start: 0,
          limit: 100,
        },
        { enabled: true, ttl: 60000 }
      );
      expect(result.data.items).toHaveLength(3);
      expect(result.data.items[0].result_score).toBeGreaterThan(0);
    });

    it('should search specific item types', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              item: {
                id: 1,
                type: 'deal',
                title: 'Deal 1',
              },
              result_score: 0.95,
            },
          ],
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tools = getUniversalSearchTool(mockClient);
      const tool = tools['search/universal'];
      await tool.handler({ term: 'test', item_types: ['deal', 'person'] });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/itemSearch',
        {
          term: 'test',
          start: 0,
          limit: 100,
          item_types: 'deal,person',
        },
        { enabled: true, ttl: 60000 }
      );
    });

    it('should search with exact match', async () => {
      const mockResponse = {
        success: true,
        data: { items: [] },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tools = getUniversalSearchTool(mockClient);
      const tool = tools['search/universal'];
      await tool.handler({ term: 'John Smith', exact_match: true });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/itemSearch',
        {
          term: 'John Smith',
          exact_match: true,
          start: 0,
          limit: 100,
        },
        { enabled: true, ttl: 60000 }
      );
    });

    it('should search specific fields', async () => {
      const mockResponse = {
        success: true,
        data: { items: [] },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tools = getUniversalSearchTool(mockClient);
      const tool = tools['search/universal'];
      await tool.handler({
        term: 'john@example.com',
        fields: 'email,phone',
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/itemSearch',
        {
          term: 'john@example.com',
          fields: 'email,phone',
          start: 0,
          limit: 100,
        },
        { enabled: true, ttl: 60000 }
      );
    });

    it('should include related items', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              item: {
                id: 1,
                type: 'deal',
                title: 'Main Deal',
              },
              result_score: 0.95,
            },
          ],
          related_items: [
            {
              item: {
                id: 2,
                type: 'person',
                name: 'Related Person',
              },
            },
          ],
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tools = getUniversalSearchTool(mockClient);
      const tool = tools['search/universal'];
      const result = await tool.handler({
        term: 'test',
        search_for_related_items: true,
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/itemSearch',
        {
          term: 'test',
          search_for_related_items: true,
          start: 0,
          limit: 100,
        },
        { enabled: true, ttl: 60000 }
      );
      expect(result.data).toHaveProperty('related_items');
    });

    it('should validate minimum search term length', async () => {
      const tools = getUniversalSearchTool(mockClient);
      const tool = tools['search/universal'];

      await expect(tool.handler({ term: 'a' })).rejects.toThrow();
      expect(mockClient.get).not.toHaveBeenCalled();
    });

    it('should allow 1 character with exact match', async () => {
      const mockResponse = {
        success: true,
        data: { items: [] },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tools = getUniversalSearchTool(mockClient);
      const tool = tools['search/universal'];
      await tool.handler({ term: 'A', exact_match: true });

      expect(mockClient.get).toHaveBeenCalled();
    });

    it('should support pagination', async () => {
      const mockResponse = {
        success: true,
        data: { items: [] },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tools = getUniversalSearchTool(mockClient);
      const tool = tools['search/universal'];
      await tool.handler({ term: 'test', start: 50, limit: 25 });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/itemSearch',
        {
          term: 'test',
          start: 50,
          limit: 25,
        },
        { enabled: true, ttl: 60000 }
      );
    });

    it('should use cache with 1 minute TTL', async () => {
      const mockResponse = {
        success: true,
        data: { items: [] },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tools = getUniversalSearchTool(mockClient);
      const tool = tools['search/universal'];
      await tool.handler({ term: 'test' });

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        { enabled: true, ttl: 60000 }
      );
    });
  });

  describe('search/by_field', () => {
    it('should search by specific field', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              item: {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
              },
              result_score: 0.99,
            },
          ],
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tools = getSearchByFieldTool(mockClient);
      const tool = tools['search/by_field'];
      const result = await tool.handler({
        term: 'john@example.com',
        field_type: 'personField',
        field_key: 'email',
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/itemSearch/field',
        {
          term: 'john@example.com',
          field_type: 'personField',
          field_key: 'email',
          start: 0,
          limit: 100,
        },
        { enabled: true, ttl: 60000 }
      );
      expect(result.data.items[0].item.email).toBe('john@example.com');
    });

    it('should validate required fields', async () => {
      const tools = getSearchByFieldTool(mockClient);
      const tool = tools['search/by_field'];

      await expect(
        tool.handler({ term: 'test' })
      ).rejects.toThrow();

      await expect(
        tool.handler({ term: 'test', field_type: 'personField' })
      ).rejects.toThrow();

      expect(mockClient.get).not.toHaveBeenCalled();
    });

    it('should validate field_type enum', async () => {
      const tools = getSearchByFieldTool(mockClient);
      const tool = tools['search/by_field'];

      await expect(
        tool.handler({
          term: 'test',
          field_type: 'invalid_type',
          field_key: 'email',
        })
      ).rejects.toThrow();

      expect(mockClient.get).not.toHaveBeenCalled();
    });
  });
});
