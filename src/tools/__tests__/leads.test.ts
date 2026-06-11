import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { getCreateLeadTool } from '../leads/create.js';
import { getUpdateLeadTool } from '../leads/update.js';
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
      const tool = tools['leads_create'];

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
      const tool = tools['leads_create'];

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
      const tool = tools['leads_create'];

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
      const tool = tools['leads_create'];

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
      const tool = tools['leads_create'];

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
      const tool = tools['leads_list'];
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
      const tool = tools['leads_list'];
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
      const tool = tools['leads_list'];
      await tool.handler({ owner_id: 5 });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/leads',
        { start: 0, limit: 100, owner_id: 5 },
        { enabled: true, ttl: 300000 }
      );
    });

    it('should validate pagination limits', async () => {
      const tools = getListLeadsTools(mockClient);
      const tool = tools['leads_list'];

      await expect(tool.handler({ limit: 501 })).rejects.toThrow();
      expect(mockClient.get).not.toHaveBeenCalled();
    });
  });
});

describe('leads/create with custom_fields', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('resolves custom fields using deal field definitions', async () => {
    const defs = [{ id: 1, key: 'a'.repeat(40), name: 'Source', field_type: 'varchar' }];
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    mockClient.post.mockResolvedValue({ success: true, data: { id: 'lead-uuid' } });

    const tools = getCreateLeadTool(mockClient);
    await tools['leads_create'].handler({
      title: 'New lead',
      custom_fields: { Source: 'Web' },
    });

    expect(mockClient.get).toHaveBeenCalledWith('/dealFields', undefined, expect.any(Object));
    expect(mockClient.post).toHaveBeenCalledWith(
      '/leads',
      expect.objectContaining({ title: 'New lead', [defs[0].key]: 'Web' })
    );
    const body = (mockClient.post.mock.calls[0] as any[])[1];
    expect(body.custom_fields).toBeUndefined();
  });
});

describe('leads/update with custom_fields', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('resolves custom fields and merges into PATCH body', async () => {
    const defs = [{ id: 1, key: 'a'.repeat(40), name: 'Source', field_type: 'varchar' }];
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    mockClient.put.mockResolvedValue({ success: true, data: { id: 'lead-uuid' } });
    mockClient.patch = vi.fn().mockResolvedValue({ success: true, data: { id: 'lead-uuid' } });

    const tools = getUpdateLeadTool(mockClient);
    await tools['leads_update'].handler({
      id: '550e8400-e29b-41d4-a716-446655440000',
      custom_fields: { Source: 'Web' },
    });

    const callArgs = mockClient.put.mock.calls[0] ?? (mockClient.patch as any).mock.calls[0];
    expect(callArgs).toBeDefined();
    expect(callArgs[1]).toEqual(expect.objectContaining({ [defs[0].key]: 'Web' }));
    expect((callArgs[1] as any).custom_fields).toBeUndefined();
  });
});

import { loadFieldDefinitions } from '../../utils/custom-fields.js';
import { getGetLeadTool } from '../leads/get.js';
import { getSearchLeadsTool } from '../leads/search.js';

describe('leads/get with enrichment', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('adds custom_fields_resolved when cache is warm (using deal field defs)', async () => {
    const defs = [{ id: 1, key: 'a'.repeat(40), name: 'Source', field_type: 'varchar' }];
    const leadId = '550e8400-e29b-41d4-a716-446655440099';

    mockClient.get = vi.fn().mockImplementation(async (endpoint: string) => {
      if (endpoint === '/dealFields') return { success: true, data: defs };
      return {
        success: true,
        data: { id: leadId, title: 'X', ['a'.repeat(40)]: 'Web' },
      };
    });

    await loadFieldDefinitions(mockClient, 'lead', { fetchIfMissing: true });

    const tools = getGetLeadTool(mockClient);
    // Use the actual key — confirm by inspection:
    const handler = tools['leads_get']?.handler ?? (tools as any).handler;
    const result = await handler({ id: leadId });

    // Adjust to actual return shape:
    if ((result as any).content) {
      const parsed = JSON.parse((result as any).content[0].text);
      expect((parsed.data as any).custom_fields_resolved).toEqual({ Source: 'Web' });
    } else {
      expect((result.data as any).custom_fields_resolved).toEqual({ Source: 'Web' });
    }
  });
});

describe('leads/search with enrichment', () => {
  it('adds custom_fields_resolved to each item in search results', async () => {
    const mockClient = createMockClient();
    const defs = [{ id: 1, key: 'a'.repeat(40), name: 'Source', field_type: 'varchar' }];

    mockClient.get = vi.fn().mockImplementation(async (endpoint: string) => {
      if (endpoint === '/dealFields') return { success: true, data: defs };
      return {
        success: true,
        data: {
          items: [
            { result_score: 1.0, item: { id: 1, title: 'Hot Lead', ['a'.repeat(40)]: 'Web' } },
          ],
        },
      };
    });

    await loadFieldDefinitions(mockClient, 'lead', { fetchIfMissing: true });

    const tools = getSearchLeadsTool(mockClient);
    const result = await tools['leads_search'].handler({ term: 'Hot' });

    const data = (result as any).content
      ? JSON.parse((result as any).content[0].text).data
      : (result as any).data;
    expect(data.items[0].item.custom_fields_resolved).toEqual({ Source: 'Web' });
  });
});
