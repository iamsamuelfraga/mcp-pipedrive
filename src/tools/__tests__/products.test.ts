import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { getCreateProductTool } from '../products/create.js';
import { getSearchProductsTool } from '../products/search.js';

describe('Products Tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  describe('products/create', () => {
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

      const tools = getCreateProductTool(mockClient);
      const tool = tools.handler;
      const result = await tool({ name: 'Test Product' });

      expect(mockClient.post).toHaveBeenCalledWith('/products', { name: 'Test Product' });
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

      const tools = getCreateProductTool(mockClient);
      const tool = tools.handler;

      const productData = {
        name: 'Premium Product',
        code: 'PREM-001',
        prices: [
          { price: 100, currency: 'USD', cost: 50 },
          { price: 85, currency: 'EUR', cost: 45 },
        ],
      };

      const result = await tool(productData);

      expect(mockClient.post).toHaveBeenCalledWith('/products', productData);
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

      const tools = getCreateProductTool(mockClient);
      const tool = tools.handler;

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

      const result = await tool(productData);

      expect(mockClient.post).toHaveBeenCalledWith('/products', productData);
      expect(result.content[0].text).toContain('Software License');
    });

    it('should validate required name field', async () => {
      const tools = getCreateProductTool(mockClient);
      const tool = tools.handler;

      await expect(tool({})).rejects.toThrow();
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should validate tax range', async () => {
      const tools = getCreateProductTool(mockClient);
      const tool = tools.handler;

      await expect(tool({ name: 'Test', tax: 150 })).rejects.toThrow();
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should validate billing frequency enum', async () => {
      const tools = getCreateProductTool(mockClient);
      const tool = tools.handler;

      await expect(tool({ name: 'Test', billing_frequency: 'invalid' })).rejects.toThrow();
      expect(mockClient.post).not.toHaveBeenCalled();
    });
  });

  describe('products/search', () => {
    it('should search products by term', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              item: {
                id: 1,
                name: 'Software License',
                code: 'SW-001',
              },
              result_score: 0.95,
            },
            {
              item: {
                id: 2,
                name: 'Software Support',
                code: 'SW-002',
              },
              result_score: 0.87,
            },
          ],
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tools = getSearchProductsTool(mockClient);
      const tool = tools['products/search'];
      const result = await tool.handler({ term: 'software' });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/products/search',
        { term: 'software', start: 0, limit: 100 },
        { enabled: true, ttl: 60000 }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should search with exact match', async () => {
      const mockResponse = {
        success: true,
        data: { items: [] },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tools = getSearchProductsTool(mockClient);
      const tool = tools['products/search'];
      await tool.handler({ term: 'SW-001', exact_match: true });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/products/search',
        { term: 'SW-001', exact_match: true, start: 0, limit: 100 },
        { enabled: true, ttl: 60000 }
      );
    });

    it('should validate minimum search term length', async () => {
      const tools = getSearchProductsTool(mockClient);
      const tool = tools['products/search'];

      await expect(tool.handler({ term: 'a' })).rejects.toThrow();
      expect(mockClient.get).not.toHaveBeenCalled();
    });
  });
});
