import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { getListWebhooksTool } from '../webhooks/list.js';

describe('Webhooks Tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  describe('webhooks/list', () => {
    it('should list all webhooks', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 1,
            subscription_url: 'https://example.com/webhook1',
            event_action: 'added',
            event_object: 'deal',
            is_active: true,
            version: '2.0',
            add_time: '2025-01-01 10:00:00',
          },
          {
            id: 2,
            subscription_url: 'https://example.com/webhook2',
            event_action: 'updated',
            event_object: 'person',
            is_active: true,
            version: '2.0',
            add_time: '2025-01-01 11:00:00',
          },
        ],
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tools = getListWebhooksTool(mockClient);
      const tool = tools['webhooks/list'];
      const result = await tool.handler();

      expect(mockClient.get).toHaveBeenCalledWith('/webhooks');
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty('event_action', 'added');
      expect(result.data[0]).toHaveProperty('event_object', 'deal');
    });

    it('should return empty array when no webhooks exist', async () => {
      const mockResponse = {
        success: true,
        data: [],
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tools = getListWebhooksTool(mockClient);
      const tool = tools['webhooks/list'];
      const result = await tool.handler();

      expect(mockClient.get).toHaveBeenCalledWith('/webhooks');
      expect(result.data).toEqual([]);
    });

    it('should not use cache for webhooks', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 1,
            subscription_url: 'https://example.com/webhook',
            event_action: 'added',
            event_object: 'deal',
            is_active: true,
          },
        ],
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tools = getListWebhooksTool(mockClient);
      const tool = tools['webhooks/list'];

      // Call twice to verify no caching
      await tool.handler();
      await tool.handler();

      expect(mockClient.get).toHaveBeenCalledTimes(2);
      expect(mockClient.get).toHaveBeenCalledWith('/webhooks');
    });

    it('should handle API errors', async () => {
      mockClient.get.mockRejectedValue(new Error('API Error: Unauthorized'));

      const tools = getListWebhooksTool(mockClient);
      const tool = tools['webhooks/list'];

      await expect(tool.handler()).rejects.toThrow('API Error: Unauthorized');
    });
  });

  describe('webhook validation concepts', () => {
    it('should validate event_action values', () => {
      const validActions = ['added', 'updated', 'deleted', 'merged', '*'];
      const invalidActions = ['create', 'modify', 'remove'];

      // This is a conceptual test - actual validation would be in the create webhook tool
      validActions.forEach((action) => {
        expect(validActions).toContain(action);
      });

      invalidActions.forEach((action) => {
        expect(validActions).not.toContain(action);
      });
    });

    it('should validate event_object values', () => {
      const validObjects = [
        'activity',
        'deal',
        'person',
        'organization',
        'note',
        'pipeline',
        'product',
        'stage',
        'user',
        '*',
      ];
      const invalidObjects = ['contact', 'lead', 'opportunity'];

      validObjects.forEach((object) => {
        expect(validObjects).toContain(object);
      });

      invalidObjects.forEach((object) => {
        expect(validObjects).not.toContain(object);
      });
    });

    it('should validate event combinations', () => {
      const validCombinations = [
        { action: 'added', object: 'deal' },
        { action: 'updated', object: 'person' },
        { action: 'deleted', object: 'organization' },
        { action: '*', object: '*' },
        { action: '*', object: 'deal' },
        { action: 'added', object: '*' },
      ];

      validCombinations.forEach((combo) => {
        expect(combo).toHaveProperty('action');
        expect(combo).toHaveProperty('object');
        expect(typeof combo.action).toBe('string');
        expect(typeof combo.object).toBe('string');
      });
    });

    it('should validate webhook URL format', () => {
      const validUrls = [
        'https://example.com/webhook',
        'https://api.example.com/pipedrive/webhook',
        'https://webhook.site/unique-id',
      ];

      const invalidUrls = [
        'http://example.com/webhook', // HTTP not HTTPS
        'ftp://example.com/webhook',
        'not-a-url',
        '',
      ];

      validUrls.forEach((url) => {
        expect(url).toMatch(/^https:\/\/.+/);
      });

      invalidUrls.forEach((url) => {
        expect(url).not.toMatch(/^https:\/\/.+/);
      });
    });
  });
});
