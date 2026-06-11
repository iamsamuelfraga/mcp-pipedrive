import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { getCreateProductTool } from '../products/create.js';
import { getUpdateProductTool } from '../products/update.js';
import { loadFieldDefinitions } from '../../utils/custom-fields.js';
import { getGetProductTool } from '../products/get.js';
import { getListProductsTool } from '../products/list.js';
import { getSearchProductsTool } from '../products/search.js';

describe('products/create', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('should create a product with name only', async () => {
    const mockResponse = {
      success: true,
      data: {
        id: 1,
        name: 'Test Product',
        code: null,
        unit: null,
        tax: 0,
        active_flag: true,
        selectable: true,
      },
    };

    mockClient.post.mockResolvedValue(mockResponse);

    const tool = getCreateProductTool(mockClient);
    const result = await tool.handler({ name: 'Test Product' });

    expect(mockClient.post).toHaveBeenCalledWith(
      '/products',
      expect.objectContaining({ name: 'Test Product' })
    );
    expect(result.content[0].text).toContain('Test Product');
  });

  it('should create a product with pricing', async () => {
    const mockResponse = {
      success: true,
      data: {
        id: 2,
        name: 'Premium Product',
        code: 'PREM-001',
        prices: [
          { price: 100, currency: 'USD', cost: 50 },
          { price: 85, currency: 'EUR', cost: 45 },
        ],
      },
    };

    mockClient.post.mockResolvedValue(mockResponse);

    const tool = getCreateProductTool(mockClient);

    const productData = {
      name: 'Premium Product',
      code: 'PREM-001',
      prices: [
        { price: 100, currency: 'USD', cost: 50 },
        { price: 85, currency: 'EUR', cost: 45 },
      ],
    };

    const result = await tool.handler(productData);

    expect(mockClient.post).toHaveBeenCalledWith(
      '/products',
      expect.objectContaining({ name: 'Premium Product', code: 'PREM-001' })
    );
    expect(result.content[0].text).toContain('Premium Product');
    expect(result.content[0].text).toContain('PREM-001');
  });

  it('should create a product with full details', async () => {
    const mockResponse = {
      success: true,
      data: {
        id: 3,
        name: 'Software License',
        code: 'SW-LIC-001',
        description: 'Annual software license',
        unit: 'licenses',
        tax: 20,
        active_flag: true,
        selectable: true,
        billing_frequency: 'annually',
        billing_frequency_cycles: 1,
        prices: [{ price: 1200, currency: 'USD', cost: 300 }],
      },
    };

    mockClient.post.mockResolvedValue(mockResponse);

    const tool = getCreateProductTool(mockClient);

    const productData = {
      name: 'Software License',
      code: 'SW-LIC-001',
      description: 'Annual software license',
      unit: 'licenses',
      tax: 20,
      billing_frequency: 'annually',
      billing_frequency_cycles: 1,
      prices: [{ price: 1200, currency: 'USD', cost: 300 }],
    };

    const result = await tool.handler(productData);

    expect(mockClient.post).toHaveBeenCalledWith(
      '/products',
      expect.objectContaining({ name: 'Software License', code: 'SW-LIC-001' })
    );
    expect(result.content[0].text).toContain('Software License');
  });

  it('should validate required name field', async () => {
    const tool = getCreateProductTool(mockClient);

    await expect(tool.handler({})).rejects.toThrow();
    expect(mockClient.post).not.toHaveBeenCalled();
  });

  it('should validate tax range', async () => {
    const tool = getCreateProductTool(mockClient);

    await expect(tool.handler({ name: 'Test', tax: 150 })).rejects.toThrow();
    expect(mockClient.post).not.toHaveBeenCalled();
  });

  it('should validate billing frequency enum', async () => {
    const tool = getCreateProductTool(mockClient);

    await expect(tool.handler({ name: 'Test', billing_frequency: 'invalid' })).rejects.toThrow();
    expect(mockClient.post).not.toHaveBeenCalled();
  });
});

describe('products/create with custom_fields', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('resolves and merges custom fields', async () => {
    const defs = [{ id: 1, key: 'a'.repeat(40), name: 'SKU Class', field_type: 'varchar' }];
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    mockClient.post.mockResolvedValue({ success: true, data: { id: 1, name: 'Widget' } });

    const tool = getCreateProductTool(mockClient);
    await tool.handler({ name: 'Widget', custom_fields: { 'SKU Class': 'A' } });

    expect(mockClient.post).toHaveBeenCalledWith(
      '/products',
      expect.objectContaining({ name: 'Widget', [defs[0].key]: 'A' })
    );
    const body = (mockClient.post.mock.calls[0] as any[])[1];
    expect(body.custom_fields).toBeUndefined();
  });
});

describe('products/update with custom_fields', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('resolves and merges custom fields into PUT body', async () => {
    const defs = [{ id: 1, key: 'a'.repeat(40), name: 'SKU Class', field_type: 'varchar' }];
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    mockClient.put.mockResolvedValue({ success: true, data: { id: 5 } });

    const tool = getUpdateProductTool(mockClient);
    await tool.handler({ id: 5, custom_fields: { 'SKU Class': 'B' } });

    expect(mockClient.put).toHaveBeenCalledWith(
      '/products/5',
      expect.objectContaining({ [defs[0].key]: 'B' })
    );
    const body = (mockClient.put.mock.calls[0] as any[])[1];
    expect(body.custom_fields).toBeUndefined();
  });
});

describe('products/get with enrichment', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('adds custom_fields_resolved when cache is warm', async () => {
    const hashKey = 'a'.repeat(40);
    const defs = [{ id: 1, key: hashKey, name: 'SKU Class', field_type: 'varchar' }];

    mockClient.get = vi.fn().mockImplementation(async (endpoint: string) => {
      if (endpoint === '/productFields') return { success: true, data: defs };
      return { success: true, data: { id: 1, name: 'Widget', [hashKey]: 'A' } };
    });

    await loadFieldDefinitions(mockClient as any, 'product', { fetchIfMissing: true });

    const tool = getGetProductTool(mockClient as any);
    const result = await tool.handler({ id: 1 });

    const parsed = JSON.parse((result as any).content[0].text);
    expect((parsed.data as any).custom_fields_resolved).toEqual({ 'SKU Class': 'A' });
  });
});

describe('products/list with enrichment', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('adds custom_fields_resolved to each item when cache is warm', async () => {
    const hashKey = 'b'.repeat(40);
    const defs = [{ id: 2, key: hashKey, name: 'SKU Class', field_type: 'varchar' }];

    mockClient.get = vi.fn().mockImplementation(async (endpoint: string) => {
      if (endpoint === '/productFields') return { success: true, data: defs };
      return { success: true, data: [{ id: 1, name: 'Widget', [hashKey]: 'A' }] };
    });

    await loadFieldDefinitions(mockClient as any, 'product', { fetchIfMissing: true });

    const tool = getListProductsTool(mockClient as any);
    const result = await tool.handler({});

    const parsed = JSON.parse((result as any).content[0].text);
    expect((parsed.data[0] as any).custom_fields_resolved).toEqual({ 'SKU Class': 'A' });
  });
});

describe('products/search with enrichment', () => {
  it('adds custom_fields_resolved to each item in search results', async () => {
    const mockClient = createMockClient();
    const hashKey = 'a'.repeat(40);
    const defs = [{ id: 1, key: hashKey, name: 'SKU Class', field_type: 'varchar' }];

    mockClient.get = vi.fn().mockImplementation(async (endpoint: string) => {
      if (endpoint === '/productFields') return { success: true, data: defs };
      return {
        success: true,
        data: {
          items: [{ result_score: 1.0, item: { id: 1, name: 'Widget', [hashKey]: 'A' } }],
        },
      };
    });

    await loadFieldDefinitions(mockClient as any, 'product', { fetchIfMissing: true });

    const tool = getSearchProductsTool(mockClient as any);
    const result = await tool.handler({ term: 'Widget' });

    const data = (result as any).content
      ? JSON.parse((result as any).content[0].text).data
      : (result as any).data;
    expect(data.items[0].item.custom_fields_resolved).toEqual({ 'SKU Class': 'A' });
  });
});
