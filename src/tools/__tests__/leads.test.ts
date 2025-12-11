import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { getCreateLeadTool } from '../leads/create.js';
import { getListLeadsTools } from '../leads/list.js';

describe('Leads Tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  describe('leads/create', () => {
    it('should create a lead with person_id', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'New Lead',
          person_id: 123,
          organization_id: null,
          owner_id: 1,
          source_name: 'API',
          origin: 'API',
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const tools = getCreateLeadTool(mockClient);
      const tool = tools['leads/create'];

      const leadData = {
        title: 'New Lead',
        person_id: 123,
      };

      const result = await tool.handler(leadData);

      expect(mockClient.post).toHaveBeenCalledWith('/leads', leadData);
      expect(result.data).toHaveProperty('id');
      expect(result.data.title).toBe('New Lead');
      expect(result.data.person_id).toBe(123);
    });

    it('should create a lead with organization_id', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Company Lead',
          person_id: null,
          organization_id: 456,
          owner_id: 1,
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const tools = getCreateLeadTool(mockClient);
      const tool = tools['leads/create'];

      const leadData = {
        title: 'Company Lead',
        organization_id: 456,
      };

      const result = await tool.handler(leadData);

      expect(mockClient.post).toHaveBeenCalledWith('/leads', leadData);
      expect(result.data.organization_id).toBe(456);
    });

    it('should create a lead with value and label_ids', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          title: 'High Value Lead',
          person_id: 123,
          value: { amount: 50000, currency: 'USD' },
          label_ids: [
            '550e8400-e29b-41d4-a716-446655440003',
            '550e8400-e29b-41d4-a716-446655440004',
          ],
          expected_close_date: '2025-12-31',
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const tools = getCreateLeadTool(mockClient);
      const tool = tools['leads/create'];

      const leadData = {
        title: 'High Value Lead',
        person_id: 123,
        value: { amount: 50000, currency: 'USD' },
        label_ids: ['550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004'],
        expected_close_date: '2025-12-31',
      };

      const result = await tool.handler(leadData);

      expect(mockClient.post).toHaveBeenCalledWith('/leads', leadData);
      expect(result.data.value).toEqual({ amount: 50000, currency: 'USD' });
      expect(result.data.label_ids).toHaveLength(2);
    });

    it('should validate required title', async () => {
      const tools = getCreateLeadTool(mockClient);
      const tool = tools['leads/create'];

      await expect(tool.handler({ person_id: 123 })).rejects.toThrow();
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should accept both person_id and organization_id', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440005',
          title: 'Test Lead',
          person_id: 123,
          organization_id: 456,
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const tools = getCreateLeadTool(mockClient);
      const tool = tools['leads/create'];

      const result = await tool.handler({
        title: 'Test Lead',
        person_id: 123,
        organization_id: 456,
      });

      expect(result.data.person_id).toBe(123);
      expect(result.data.organization_id).toBe(456);
    });
  });

  describe('leads/list', () => {
    it('should list leads with default pagination', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Lead 1',
            person_id: 123,
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'Lead 2',
            organization_id: 456,
          },
        ],
        additional_data: {
          pagination: {
            start: 0,
            limit: 100,
            more_items_in_collection: false,
          },
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tools = getListLeadsTools(mockClient);
      const tool = tools['leads/list'];
      const result = await tool.handler({});

      expect(mockClient.get).toHaveBeenCalledWith(
        '/leads',
        { start: 0, limit: 100 },
        { enabled: true, ttl: 300000 }
      );
      expect(result.data).toHaveLength(2);
    });

    it('should list leads with custom pagination', async () => {
      const mockResponse = {
        success: true,
        data: [],
        additional_data: {
          pagination: {
            start: 50,
            limit: 25,
            more_items_in_collection: true,
          },
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tools = getListLeadsTools(mockClient);
      const tool = tools['leads/list'];
      await tool.handler({ start: 50, limit: 25 });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/leads',
        { start: 50, limit: 25 },
        { enabled: true, ttl: 300000 }
      );
    });

    it('should list leads with filters', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Owner Lead',
            owner_id: 5,
          },
        ],
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tools = getListLeadsTools(mockClient);
      const tool = tools['leads/list'];
      await tool.handler({ owner_id: 5 });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/leads',
        { start: 0, limit: 100, owner_id: 5 },
        { enabled: true, ttl: 300000 }
      );
    });

    it('should validate pagination limits', async () => {
      const tools = getListLeadsTools(mockClient);
      const tool = tools['leads/list'];

      await expect(tool.handler({ limit: 501 })).rejects.toThrow();
      expect(mockClient.get).not.toHaveBeenCalled();
    });
  });
});
