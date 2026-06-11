import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { getCreateDealTool } from '../deals/create.js';
import { getGetDealTool } from '../deals/get.js';
import { getUpdateDealTools } from '../deals/update.js';
import { loadFieldDefinitions } from '../../utils/custom-fields.js';
import { getListDealsTools } from '../deals/list.js';
import { getSearchDealsTool } from '../deals/search.js';

describe('Deals Tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  describe('deals/create', () => {
    it('should create a deal with required fields only', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          title: 'Test Deal',
          value: 0,
          currency: 'USD',
          status: 'open',
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const tools = getCreateDealTool(mockClient);
      const tool = tools['deals_create'];
      const result = await tool.handler({ title: 'Test Deal' });

      expect(mockClient.post).toHaveBeenCalledWith('/deals', {
        title: 'Test Deal',
        status: 'open',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should create a deal with full details', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 2,
          title: 'Big Deal',
          value: 50000,
          currency: 'USD',
          person_id: 123,
          org_id: 456,
          pipeline_id: 1,
          stage_id: 2,
          status: 'open',
          probability: 75,
          expected_close_date: '2025-12-31',
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const tools = getCreateDealTool(mockClient);
      const tool = tools['deals_create'];

      const dealData = {
        title: 'Big Deal',
        value: 50000,
        currency: 'USD',
        person_id: 123,
        org_id: 456,
        pipeline_id: 1,
        stage_id: 2,
        probability: 75,
        expected_close_date: '2025-12-31',
      };

      const result = await tool.handler(dealData);

      expect(mockClient.post).toHaveBeenCalledWith('/deals', { ...dealData, status: 'open' });
      expect(result).toHaveProperty('success', true);
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('value', 50000);
    });

    it('should validate required title field', async () => {
      const tools = getCreateDealTool(mockClient);
      const tool = tools['deals_create'];

      await expect(tool.handler({})).rejects.toThrow();
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should validate negative value', async () => {
      const tools = getCreateDealTool(mockClient);
      const tool = tools['deals_create'];

      await expect(tool.handler({ title: 'Test', value: -100 })).rejects.toThrow();
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should validate probability range', async () => {
      const tools = getCreateDealTool(mockClient);
      const tool = tools['deals_create'];

      await expect(tool.handler({ title: 'Test', probability: 150 })).rejects.toThrow();
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should validate visibility enum', async () => {
      const tools = getCreateDealTool(mockClient);
      const tool = tools['deals_create'];

      await expect(tool.handler({ title: 'Test', visible_to: '10' })).rejects.toThrow();
      expect(mockClient.post).not.toHaveBeenCalled();
    });
  });

  describe('deals/get', () => {
    it('should get a deal by id', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          title: 'Test Deal',
          value: 1000,
          currency: 'USD',
          status: 'open',
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tools = getGetDealTool(mockClient);
      const tool = tools['deals_get'];
      const result = await tool.handler({ id: 1 });

      expect(mockClient.get).toHaveBeenCalledWith('/deals/1', undefined, {
        enabled: true,
        ttl: 300000,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should validate required id field', async () => {
      const tools = getGetDealTool(mockClient);
      const tool = tools['deals_get'];

      await expect(tool.handler({})).rejects.toThrow();
      expect(mockClient.get).not.toHaveBeenCalled();
    });

    it('should validate positive id', async () => {
      const tools = getGetDealTool(mockClient);
      const tool = tools['deals_get'];

      await expect(tool.handler({ id: -1 })).rejects.toThrow();
      expect(mockClient.get).not.toHaveBeenCalled();
    });
  });
});

describe('deals/create with custom_fields', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('resolves custom_fields by name and merges hash-keyed values into the request', async () => {
    const defs = [
      {
        id: 1,
        key: 'a'.repeat(40),
        name: 'Industria',
        field_type: 'enum',
        options: [{ id: 10, label: 'Tech' }],
      },
    ];
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    mockClient.post.mockResolvedValue({ success: true, data: { id: 1 } });

    const tools = getCreateDealTool(mockClient);
    await tools['deals_create'].handler({
      title: 'X',
      custom_fields: { Industria: 'Tech' },
    });

    expect(mockClient.post).toHaveBeenCalledWith(
      '/deals',
      expect.objectContaining({ title: 'X', [defs[0].key]: 10, status: 'open' })
    );
    // custom_fields itself must not be sent to Pipedrive
    const body = (mockClient.post.mock.calls[0] as any[])[1];
    expect(body.custom_fields).toBeUndefined();
  });
});

describe('deals/update with custom_fields', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('merges resolved custom fields into the PUT body', async () => {
    const defs = [{ id: 1, key: 'a'.repeat(40), name: 'Budget', field_type: 'monetary' }];
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    mockClient.put.mockResolvedValue({ success: true, data: { id: 1 } });

    const tools = getUpdateDealTools(mockClient);
    await tools['deals_update'].handler({
      id: 1,
      custom_fields: { Budget: 9999 },
    });

    expect(mockClient.put).toHaveBeenCalledWith(
      '/deals/1',
      expect.objectContaining({ [defs[0].key]: 9999 })
    );
    const body = (mockClient.put.mock.calls[0] as any[])[1];
    expect(body.custom_fields).toBeUndefined();
  });
});

describe('deals/get with enrichment', () => {
  it('adds custom_fields_resolved when cache is warm', async () => {
    const mockClient = createMockClient();
    const defs = [
      {
        id: 1,
        key: 'a'.repeat(40),
        name: 'Industria',
        field_type: 'enum',
        options: [{ id: 10, label: 'Tech' }],
      },
    ];

    mockClient.get = vi.fn().mockImplementation(async (endpoint: string) => {
      if (endpoint === '/dealFields') return { success: true, data: defs };
      return { success: true, data: { id: 1, title: 'X', ['a'.repeat(40)]: 10 } };
    });

    // Warm the cache once.
    await loadFieldDefinitions(mockClient, 'deal', { fetchIfMissing: true });

    const tools = getGetDealTool(mockClient);
    const result = await tools['deals_get'].handler({ id: 1 });

    expect((result.data as any).custom_fields_resolved).toEqual({ Industria: 'Tech' });
    expect((result.data as any).title).toBe('X');
  });
});

describe('deals/list with enrichment', () => {
  it('adds custom_fields_resolved to each item in the list', async () => {
    const mockClient = createMockClient();
    const defs = [
      {
        id: 1,
        key: 'a'.repeat(40),
        name: 'Industria',
        field_type: 'enum',
        options: [{ id: 10, label: 'Tech' }],
      },
    ];

    mockClient.get = vi.fn().mockImplementation(async (endpoint: string) => {
      if (endpoint === '/dealFields') return { success: true, data: defs };
      return {
        success: true,
        data: [
          { id: 1, title: 'A', ['a'.repeat(40)]: 10 },
          { id: 2, title: 'B', ['a'.repeat(40)]: 10 },
        ],
      };
    });

    await loadFieldDefinitions(mockClient, 'deal', { fetchIfMissing: true });

    const tools = getListDealsTools(mockClient);
    const result = await tools['deals_list'].handler({});

    expect((result.data as any[])[0].custom_fields_resolved).toEqual({ Industria: 'Tech' });
    expect((result.data as any[])[1].custom_fields_resolved).toEqual({ Industria: 'Tech' });
  });
});

describe('deals/search with enrichment', () => {
  it('adds custom_fields_resolved to each item in search results', async () => {
    const mockClient = createMockClient();
    const defs = [{ id: 1, key: 'a'.repeat(40), name: 'Industria', field_type: 'varchar' }];
    mockClient.get = vi.fn().mockImplementation(async (endpoint: string) => {
      if (endpoint === '/dealFields') return { success: true, data: defs };
      return {
        success: true,
        data: {
          items: [{ result_score: 1.0, item: { id: 1, title: 'X', ['a'.repeat(40)]: 'Tech' } }],
        },
      };
    });

    await loadFieldDefinitions(mockClient, 'deal', { fetchIfMissing: true });

    const tools = getSearchDealsTool(mockClient);
    const result = await tools['deals_search'].handler({ term: 'Xa' });

    const data = (result as any).content
      ? JSON.parse((result as any).content[0].text).data
      : (result as any).data;
    expect(data.items[0].item.custom_fields_resolved).toEqual({ Industria: 'Tech' });
  });
});
