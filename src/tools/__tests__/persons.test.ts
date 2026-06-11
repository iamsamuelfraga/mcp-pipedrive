import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { getCreatePersonTool } from '../persons/create.js';
import { getUpdatePersonTool } from '../persons/update.js';
import { loadFieldDefinitions } from '../../utils/custom-fields.js';
import { getGetPersonTool } from '../persons/get.js';
import { getListPersonsTool } from '../persons/list.js';
import { getSearchPersonsTool } from '../persons/search.js';

describe('Persons Tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  describe('persons/create', () => {
    it('should create a person with name only', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          name: 'John Doe',
          owner_id: 1,
          org_id: null,
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const tools = getCreatePersonTool(mockClient);
      const tool = tools.handler;
      const result = await tool({ name: 'John Doe' });

      expect(mockClient.post).toHaveBeenCalledWith('/persons', { name: 'John Doe' });
      expect(result.content[0].text).toContain('John Doe');
    });

    it('should create a person with email array', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 2,
          name: 'Jane Smith',
          email: [
            { value: 'jane@company.com', primary: true, label: 'work' },
            { value: 'jane@personal.com', primary: false, label: 'home' },
          ],
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const tools = getCreatePersonTool(mockClient);
      const tool = tools.handler;

      const personData = {
        name: 'Jane Smith',
        email: [
          { value: 'jane@company.com', primary: true, label: 'work' },
          { value: 'jane@personal.com', primary: false, label: 'home' },
        ],
      };

      const result = await tool(personData);

      expect(mockClient.post).toHaveBeenCalledWith('/persons', personData);
      expect(result.content[0].text).toContain('jane@company.com');
    });

    it('should create a person with phone array', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 3,
          name: 'Bob Johnson',
          phone: [{ value: '+1-555-0123', primary: true, label: 'mobile' }],
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const tools = getCreatePersonTool(mockClient);
      const tool = tools.handler;

      const personData = {
        name: 'Bob Johnson',
        phone: [{ value: '+1-555-0123', primary: true, label: 'mobile' }],
      };

      const result = await tool(personData);

      expect(mockClient.post).toHaveBeenCalledWith('/persons', personData);
      expect(result.content[0].text).toContain('+1-555-0123');
    });

    it('should validate required name field', async () => {
      const tools = getCreatePersonTool(mockClient);
      const tool = tools.handler;

      await expect(tool({})).rejects.toThrow();
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      const tools = getCreatePersonTool(mockClient);
      const tool = tools.handler;

      await expect(
        tool({
          name: 'Test',
          email: [{ value: 'invalid-email', primary: true }],
        })
      ).rejects.toThrow();
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should validate marketing status enum', async () => {
      const tools = getCreatePersonTool(mockClient);
      const tool = tools.handler;

      await expect(
        tool({
          name: 'Test',
          marketing_status: 'invalid_status',
        })
      ).rejects.toThrow();
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should create a person with job_title', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 4,
          name: 'Alice Carter',
          job_title: 'Head of Marketing',
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const tools = getCreatePersonTool(mockClient);
      const tool = tools.handler;

      const personData = {
        name: 'Alice Carter',
        job_title: 'Head of Marketing',
      };

      const result = await tool(personData);

      expect(mockClient.post).toHaveBeenCalledWith('/persons', personData);
      expect(result.content[0].text).toContain('Head of Marketing');
    });

    it('should reject job_title longer than 255 characters', async () => {
      const tools = getCreatePersonTool(mockClient);
      const tool = tools.handler;

      await expect(
        tool({
          name: 'Test',
          job_title: 'x'.repeat(256),
        })
      ).rejects.toThrow();
      expect(mockClient.post).not.toHaveBeenCalled();
    });
  });

  describe('persons/update', () => {
    it('should update a person', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          name: 'Updated Name',
          email: [{ value: 'new@email.com', primary: true }],
        },
      };

      mockClient.put.mockResolvedValue(mockResponse);

      const tools = getUpdatePersonTool(mockClient);
      const tool = tools.handler;

      const updateData = {
        id: 1,
        name: 'Updated Name',
        email: [{ value: 'new@email.com', primary: true }],
      };

      const result = await tool(updateData);

      expect(mockClient.put).toHaveBeenCalledWith('/persons/1', {
        name: 'Updated Name',
        email: [{ value: 'new@email.com', primary: true }],
      });
      expect(result.content[0].text).toContain('Updated Name');
    });

    it('should validate required id field', async () => {
      const tools = getUpdatePersonTool(mockClient);
      const tool = tools.handler;

      await expect(tool({ name: 'Test' })).rejects.toThrow();
      expect(mockClient.put).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      mockClient.put.mockRejectedValue(new Error('API Error: Person not found'));

      const tools = getUpdatePersonTool(mockClient);
      const tool = tools.handler;

      await expect(tool({ id: 999, name: 'Test' })).rejects.toThrow('API Error: Person not found');
    });

    it('should update a person with job_title', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 5,
          name: 'Updated',
          job_title: 'VP of Sales',
        },
      };

      mockClient.put.mockResolvedValue(mockResponse);

      const tools = getUpdatePersonTool(mockClient);
      const tool = tools.handler;

      const result = await tool({ id: 5, job_title: 'VP of Sales' });

      expect(mockClient.put).toHaveBeenCalledWith('/persons/5', {
        job_title: 'VP of Sales',
      });
      expect(result.content[0].text).toContain('VP of Sales');
    });
  });

  describe('persons/create with custom_fields', () => {
    it('resolves and merges custom fields', async () => {
      const defs = [{ id: 1, key: 'a'.repeat(40), name: 'Region', field_type: 'varchar' }];
      mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
      mockClient.post.mockResolvedValue({ success: true, data: { id: 1, name: 'X' } });

      const tools = getCreatePersonTool(mockClient);
      await tools.handler({ name: 'X', custom_fields: { Region: 'EU' } });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/persons',
        expect.objectContaining({ name: 'X', [defs[0].key]: 'EU' })
      );
      const body = (mockClient.post.mock.calls[0] as any[])[1];
      expect(body.custom_fields).toBeUndefined();
    });
  });

  describe('persons/update with custom_fields', () => {
    it('resolves and merges custom fields into PUT body', async () => {
      const defs = [{ id: 1, key: 'a'.repeat(40), name: 'Region', field_type: 'varchar' }];
      mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
      mockClient.put.mockResolvedValue({ success: true, data: { id: 1 } });

      const tools = getUpdatePersonTool(mockClient);
      await tools.handler({ id: 1, custom_fields: { Region: 'EU' } });

      expect(mockClient.put).toHaveBeenCalledWith(
        '/persons/1',
        expect.objectContaining({ [defs[0].key]: 'EU' })
      );
      const body = (mockClient.put.mock.calls[0] as any[])[1];
      expect(body.custom_fields).toBeUndefined();
    });
  });
});

describe('persons/get with enrichment', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('adds custom_fields_resolved when cache is warm', async () => {
    const hashKey = 'a'.repeat(40);
    const defs = [{ id: 1, key: hashKey, name: 'Region', field_type: 'varchar' }];

    mockClient.get = vi.fn().mockImplementation(async (endpoint: string) => {
      if (endpoint === '/personFields') return { success: true, data: defs };
      return { success: true, data: { id: 1, name: 'X', [hashKey]: 'EU' } };
    });

    await loadFieldDefinitions(mockClient as any, 'person', { fetchIfMissing: true });

    const tool = getGetPersonTool(mockClient as any);
    const result = await tool.handler({ id: 1 });

    // persons/get wraps response in { content: [{ text: JSON }] }
    const parsed = JSON.parse((result as any).content[0].text);
    expect((parsed.data as any).custom_fields_resolved).toEqual({ Region: 'EU' });
  });
});

describe('persons/list with enrichment', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('adds custom_fields_resolved to each item when cache is warm', async () => {
    const hashKey = 'b'.repeat(40);
    const defs = [{ id: 2, key: hashKey, name: 'Tier', field_type: 'varchar' }];

    mockClient.get = vi.fn().mockImplementation(async (endpoint: string) => {
      if (endpoint === '/personFields') return { success: true, data: defs };
      return { success: true, data: [{ id: 1, name: 'Alice', [hashKey]: 'Gold' }] };
    });

    await loadFieldDefinitions(mockClient as any, 'person', { fetchIfMissing: true });

    const tool = getListPersonsTool(mockClient as any);
    const result = await tool.handler({});

    const parsed = JSON.parse((result as any).content[0].text);
    expect((parsed.data[0] as any).custom_fields_resolved).toEqual({ Tier: 'Gold' });
  });
});

describe('persons/search with enrichment', () => {
  it('adds custom_fields_resolved to each item in search results', async () => {
    const mockClient = createMockClient();
    const defs = [{ id: 1, key: 'a'.repeat(40), name: 'Region', field_type: 'varchar' }];
    mockClient.get = vi.fn().mockImplementation(async (endpoint: string) => {
      if (endpoint === '/personFields') return { success: true, data: defs };
      return {
        success: true,
        data: {
          items: [{ result_score: 1.0, item: { id: 1, name: 'Alice', ['a'.repeat(40)]: 'EU' } }],
        },
      };
    });

    await loadFieldDefinitions(mockClient as any, 'person', { fetchIfMissing: true });

    const tool = getSearchPersonsTool(mockClient as any);
    const result = await tool.handler({ term: 'Alice' });

    const data = (result as any).content
      ? JSON.parse((result as any).content[0].text).data
      : (result as any).data;
    expect(data.items[0].item.custom_fields_resolved).toEqual({ Region: 'EU' });
  });
});
