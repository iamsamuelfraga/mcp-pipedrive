import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { getCreateDealTool } from '../deals/create.js';
import { getGetDealTool } from '../deals/get.js';

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
      const tool = tools['deals/create'];
      const result = await tool.handler({ title: 'Test Deal' });

      expect(mockClient.post).toHaveBeenCalledWith('/deals', { title: 'Test Deal', status: 'open' });
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
      const tool = tools['deals/create'];

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
      const tool = tools['deals/create'];

      await expect(tool.handler({})).rejects.toThrow();
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should validate negative value', async () => {
      const tools = getCreateDealTool(mockClient);
      const tool = tools['deals/create'];

      await expect(
        tool.handler({ title: 'Test', value: -100 })
      ).rejects.toThrow();
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should validate probability range', async () => {
      const tools = getCreateDealTool(mockClient);
      const tool = tools['deals/create'];

      await expect(
        tool.handler({ title: 'Test', probability: 150 })
      ).rejects.toThrow();
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should validate visibility enum', async () => {
      const tools = getCreateDealTool(mockClient);
      const tool = tools['deals/create'];

      await expect(
        tool.handler({ title: 'Test', visible_to: '10' })
      ).rejects.toThrow();
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
      const tool = tools['deals/get'];
      const result = await tool.handler({ id: 1 });

      expect(mockClient.get).toHaveBeenCalledWith('/deals/1', undefined, { enabled: true, ttl: 300000 });
      expect(result).toEqual(mockResponse);
    });

    it('should validate required id field', async () => {
      const tools = getGetDealTool(mockClient);
      const tool = tools['deals/get'];

      await expect(tool.handler({})).rejects.toThrow();
      expect(mockClient.get).not.toHaveBeenCalled();
    });

    it('should validate positive id', async () => {
      const tools = getGetDealTool(mockClient);
      const tool = tools['deals/get'];

      await expect(tool.handler({ id: -1 })).rejects.toThrow();
      expect(mockClient.get).not.toHaveBeenCalled();
    });
  });
});
