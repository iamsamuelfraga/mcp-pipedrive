import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { createCreateOrganizationTool } from '../organizations/create.js';
import { createUpdateOrganizationTool } from '../organizations/update.js';
import { loadFieldDefinitions } from '../../utils/custom-fields.js';
import { createGetOrganizationTool } from '../organizations/get.js';
import { createListOrganizationsTool } from '../organizations/list.js';
import { createSearchOrganizationsTool } from '../organizations/search.js';

describe('organizations/create with custom_fields', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('resolves custom_fields by name and merges hash-keyed values', async () => {
    const defs = [{ id: 1, key: 'a'.repeat(40), name: 'Tier', field_type: 'varchar' }];
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    mockClient.post.mockResolvedValue({ success: true, data: { id: 1, name: 'ACME' } });

    const tool = createCreateOrganizationTool(mockClient);
    await tool.handler({ name: 'ACME', custom_fields: { Tier: 'Gold' } });

    expect(mockClient.post).toHaveBeenCalledWith(
      '/organizations',
      expect.objectContaining({ name: 'ACME', [defs[0].key]: 'Gold' })
    );
    const body = (mockClient.post.mock.calls[0] as any[])[1];
    expect(body.custom_fields).toBeUndefined();
  });
});

describe('organizations/update with custom_fields', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('resolves and merges custom fields into PUT body', async () => {
    const defs = [{ id: 1, key: 'a'.repeat(40), name: 'Tier', field_type: 'varchar' }];
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    mockClient.put.mockResolvedValue({ success: true, data: { id: 5 } });

    const tool = createUpdateOrganizationTool(mockClient);
    await tool.handler({ id: 5, custom_fields: { Tier: 'Platinum' } });

    expect(mockClient.put).toHaveBeenCalledWith(
      '/organizations/5',
      expect.objectContaining({ [defs[0].key]: 'Platinum' })
    );
    const body = (mockClient.put.mock.calls[0] as any[])[1];
    expect(body.custom_fields).toBeUndefined();
  });
});

describe('organizations/get with enrichment', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('adds custom_fields_resolved when cache is warm', async () => {
    const hashKey = 'a'.repeat(40);
    const defs = [{ id: 1, key: hashKey, name: 'Tier', field_type: 'varchar' }];

    mockClient.get = vi.fn().mockImplementation(async (endpoint: string) => {
      if (endpoint === '/organizationFields') return { success: true, data: defs };
      return { success: true, data: { id: 1, name: 'ACME', [hashKey]: 'Gold' } };
    });

    await loadFieldDefinitions(mockClient as any, 'organization', { fetchIfMissing: true });

    const tool = createGetOrganizationTool(mockClient as any);
    const result = await tool.handler({ id: 1 });

    const parsed = JSON.parse((result as any).content[0].text);
    expect((parsed.data as any).custom_fields_resolved).toEqual({ Tier: 'Gold' });
  });
});

describe('organizations/list with enrichment', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('adds custom_fields_resolved to each item when cache is warm', async () => {
    const hashKey = 'b'.repeat(40);
    const defs = [{ id: 2, key: hashKey, name: 'Tier', field_type: 'varchar' }];

    mockClient.get = vi.fn().mockImplementation(async (endpoint: string) => {
      if (endpoint === '/organizationFields') return { success: true, data: defs };
      return { success: true, data: [{ id: 1, name: 'ACME', [hashKey]: 'Gold' }] };
    });

    await loadFieldDefinitions(mockClient as any, 'organization', { fetchIfMissing: true });

    const tool = createListOrganizationsTool(mockClient as any);
    const result = await tool.handler({});

    const parsed = JSON.parse((result as any).content[0].text);
    expect((parsed.data[0] as any).custom_fields_resolved).toEqual({ Tier: 'Gold' });
  });
});

describe('organizations/search with enrichment', () => {
  it('adds custom_fields_resolved to each item in search results', async () => {
    const mockClient = createMockClient();
    const hashKey = 'a'.repeat(40);
    const defs = [{ id: 1, key: hashKey, name: 'Tier', field_type: 'varchar' }];

    mockClient.get = vi.fn().mockImplementation(async (endpoint: string) => {
      if (endpoint === '/organizationFields') return { success: true, data: defs };
      return {
        success: true,
        data: {
          items: [{ result_score: 1.0, item: { id: 1, name: 'ACME', [hashKey]: 'Gold' } }],
        },
      };
    });

    await loadFieldDefinitions(mockClient as any, 'organization', { fetchIfMissing: true });

    const tool = createSearchOrganizationsTool(mockClient as any);
    const result = await tool.handler({ term: 'ACME' });

    const data = (result as any).content
      ? JSON.parse((result as any).content[0].text).data
      : (result as any).data;
    expect(data.items[0].item.custom_fields_resolved).toEqual({ Tier: 'Gold' });
  });
});
