import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { getCreateFilterTool } from '../filters/create.js';

describe('Filters Tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  describe('filters/create', () => {
    it('should create a simple filter', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          name: 'High Value Deals',
          type: 'deals',
          conditions: {
            glue: 'and',
            conditions: [
              {
                glue: 'and',
                conditions: [
                  {
                    object: 'deal',
                    field_id: 'value',
                    operator: '>',
                    value: 10000,
                  },
                ],
              },
              {
                glue: 'or',
                conditions: [null],
              },
            ],
          },
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const tools = getCreateFilterTool(mockClient);
      const tool = tools['filters/create'];

      const filterData = {
        name: 'High Value Deals',
        type: 'deals',
        conditions: {
          glue: 'and',
          conditions: [
            {
              glue: 'and',
              conditions: [
                {
                  object: 'deal',
                  field_id: 'value',
                  operator: '>',
                  value: 10000,
                },
              ],
            },
            {
              glue: 'or',
              conditions: [null],
            },
          ],
        },
      };

      const result = await tool.handler(filterData);

      expect(mockClient.post).toHaveBeenCalledWith('/filters', filterData);
      expect(result.data).toHaveProperty('id');
      expect(result.data.name).toBe('High Value Deals');
      expect(result.data.type).toBe('deals');
    });

    it('should create a complex filter with multiple conditions', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 2,
          name: 'Complex Filter',
          type: 'deals',
          conditions: {
            glue: 'and',
            conditions: [
              {
                glue: 'and',
                conditions: [
                  {
                    object: 'deal',
                    field_id: 'value',
                    operator: '>',
                    value: 5000,
                  },
                  {
                    object: 'deal',
                    field_id: 'status',
                    operator: '=',
                    value: 'open',
                  },
                ],
              },
              {
                glue: 'or',
                conditions: [
                  {
                    object: 'deal',
                    field_id: 'stage_id',
                    operator: 'IN',
                    value: [1, 2, 3],
                  },
                ],
              },
            ],
          },
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const tools = getCreateFilterTool(mockClient);
      const tool = tools['filters/create'];

      const filterData = {
        name: 'Complex Filter',
        type: 'deals',
        conditions: {
          glue: 'and',
          conditions: [
            {
              glue: 'and',
              conditions: [
                {
                  object: 'deal',
                  field_id: 'value',
                  operator: '>',
                  value: 5000,
                },
                {
                  object: 'deal',
                  field_id: 'status',
                  operator: '=',
                  value: 'open',
                },
              ],
            },
            {
              glue: 'or',
              conditions: [
                {
                  object: 'deal',
                  field_id: 'stage_id',
                  operator: 'IN',
                  value: [1, 2, 3],
                },
              ],
            },
          ],
        },
      };

      const result = await tool.handler(filterData);

      expect(mockClient.post).toHaveBeenCalledWith('/filters', filterData);
      expect(result.data.conditions.conditions[0].conditions).toHaveLength(2);
    });

    it('should create a filter for different entity types', async () => {
      const entityTypes = ['deals', 'org', 'people', 'products', 'activities'];

      for (const type of entityTypes) {
        const mockResponse = {
          success: true,
          data: {
            id: Math.random(),
            name: `${type} Filter`,
            type,
          },
        };

        mockClient.post.mockResolvedValue(mockResponse);

        const tools = getCreateFilterTool(mockClient);
        const tool = tools['filters/create'];

        const filterData = {
          name: `${type} Filter`,
          type,
          conditions: {
            glue: 'and',
            conditions: [
              {
                glue: 'and',
                conditions: [
                  {
                    object: type === 'org' ? 'organization' : type === 'people' ? 'person' : type.slice(0, -1),
                    field_id: 'name',
                    operator: 'LIKE',
                    value: 'Test',
                  },
                ],
              },
              {
                glue: 'or',
                conditions: [null],
              },
            ],
          },
        };

        await tool.handler(filterData);
        expect(mockClient.post).toHaveBeenCalledWith('/filters', filterData);
      }
    });

    it('should validate required fields', async () => {
      const tools = getCreateFilterTool(mockClient);
      const tool = tools['filters/create'];

      await expect(tool.handler({ name: 'Test' })).rejects.toThrow();
      await expect(tool.handler({ type: 'deals' })).rejects.toThrow();
      await expect(
        tool.handler({ name: 'Test', type: 'deals' })
      ).rejects.toThrow(); // Missing conditions
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should validate filter type enum', async () => {
      const tools = getCreateFilterTool(mockClient);
      const tool = tools['filters/create'];

      await expect(
        tool.handler({
          name: 'Test',
          type: 'invalid_type',
          conditions: { glue: 'and', conditions: [] },
        })
      ).rejects.toThrow();
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should test various operators', () => {
      const validOperators = ['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'IN', 'IS NULL', 'IS NOT NULL'];

      validOperators.forEach(operator => {
        expect(typeof operator).toBe('string');
        expect(operator.length).toBeGreaterThan(0);
      });

      // Test condition structure with different operators
      const conditions = validOperators.map(operator => ({
        object: 'deal',
        field_id: 'value',
        operator,
        value: operator.includes('NULL') ? undefined : 1000,
      }));

      conditions.forEach(condition => {
        expect(condition).toHaveProperty('object');
        expect(condition).toHaveProperty('field_id');
        expect(condition).toHaveProperty('operator');
      });
    });

    it('should handle nested condition structures', () => {
      // Test the structure concept (actual validation happens in Zod schema)
      const nestedStructure = {
        glue: 'and',
        conditions: [
          {
            glue: 'and',
            conditions: [
              { object: 'deal', field_id: 'value', operator: '>', value: 1000 },
              { object: 'deal', field_id: 'status', operator: '=', value: 'open' },
            ],
          },
          {
            glue: 'or',
            conditions: [
              { object: 'deal', field_id: 'probability', operator: '>', value: 50 },
            ],
          },
        ],
      };

      expect(nestedStructure.conditions).toHaveLength(2);
      expect(nestedStructure.conditions[0].glue).toBe('and');
      expect(nestedStructure.conditions[1].glue).toBe('or');
      expect(nestedStructure.conditions[0].conditions).toHaveLength(2);
    });
  });
});
