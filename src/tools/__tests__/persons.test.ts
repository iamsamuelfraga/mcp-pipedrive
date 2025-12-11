import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { getCreatePersonTool } from '../persons/create.js';
import { getUpdatePersonTool } from '../persons/update.js';

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
  });
});
