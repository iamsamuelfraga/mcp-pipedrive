import { describe, it, expect } from 'vitest';
import {
  CreateFilterSchema,
  UpdateFilterSchema,
  ListFiltersSchema,
  FilterTypeSchema,
  FilterOperatorSchema,
  FilterConditionLeafSchema,
  FilterConditionGroupSchema,
} from '../filter.js';

describe('FilterTypeSchema', () => {
  it('should accept valid filter types', () => {
    const validTypes = ['deals', 'org', 'people', 'products', 'activities'];
    validTypes.forEach((type) => {
      expect(() => FilterTypeSchema.parse(type)).not.toThrow();
    });
  });

  it('should reject invalid filter type', () => {
    expect(() => FilterTypeSchema.parse('leads')).toThrow(
      'Type must be one of: deals, org, people, products, activities'
    );
  });

  it('should be case-sensitive', () => {
    expect(() => FilterTypeSchema.parse('Deals')).toThrow();
  });
});

describe('FilterOperatorSchema', () => {
  it('should accept all valid operators', () => {
    const validOperators = [
      '=',
      '!=',
      '<',
      '>',
      '<=',
      '>=',
      'IS NULL',
      'IS NOT NULL',
      'LIKE',
      'NOT LIKE',
      'IN',
      'NOT IN',
    ];
    validOperators.forEach((op) => {
      expect(() => FilterOperatorSchema.parse(op)).not.toThrow();
    });
  });

  it('should reject invalid operator', () => {
    expect(() => FilterOperatorSchema.parse('==')).toThrow('Invalid operator');
  });

  it('should be case-sensitive for operators', () => {
    expect(() => FilterOperatorSchema.parse('is null')).toThrow();
  });
});

describe('FilterConditionLeafSchema', () => {
  it('should accept valid simple condition', () => {
    const valid = {
      object: 'deal',
      field_id: 'title',
      operator: '=',
      value: 'Test Deal',
    };
    expect(() => FilterConditionLeafSchema.parse(valid)).not.toThrow();
  });

  it('should accept condition with numeric value', () => {
    const valid = {
      object: 'deal',
      field_id: 'value',
      operator: '>',
      value: 1000,
    };
    expect(() => FilterConditionLeafSchema.parse(valid)).not.toThrow();
  });

  it('should accept condition with boolean value', () => {
    const valid = {
      object: 'deal',
      field_id: 'active_flag',
      operator: '=',
      value: true,
    };
    expect(() => FilterConditionLeafSchema.parse(valid)).not.toThrow();
  });

  it('should accept condition with null value', () => {
    const valid = {
      object: 'deal',
      field_id: 'expected_close_date',
      operator: 'IS NULL',
      value: null,
    };
    expect(() => FilterConditionLeafSchema.parse(valid)).not.toThrow();
  });

  it('should accept condition with array value for IN operator', () => {
    const valid = {
      object: 'deal',
      field_id: 'stage_id',
      operator: 'IN',
      value: [1, 2, 3, 4],
    };
    expect(() => FilterConditionLeafSchema.parse(valid)).not.toThrow();
  });

  it('should accept condition with string array for IN operator', () => {
    const valid = {
      object: 'deal',
      field_id: 'status',
      operator: 'IN',
      value: ['open', 'won'],
    };
    expect(() => FilterConditionLeafSchema.parse(valid)).not.toThrow();
  });

  it('should accept condition without value', () => {
    const valid = {
      object: 'deal',
      field_id: 'title',
      operator: 'IS NOT NULL',
    };
    expect(() => FilterConditionLeafSchema.parse(valid)).not.toThrow();
  });

  it('should accept condition with extra_value for range', () => {
    const valid = {
      object: 'deal',
      field_id: 'value',
      operator: '>=',
      value: 1000,
      extra_value: 5000,
    };
    expect(() => FilterConditionLeafSchema.parse(valid)).not.toThrow();
  });

  it('should accept LIKE operator with pattern', () => {
    const valid = {
      object: 'deal',
      field_id: 'title',
      operator: 'LIKE',
      value: '%Test%',
    };
    expect(() => FilterConditionLeafSchema.parse(valid)).not.toThrow();
  });
});

describe('FilterConditionGroupSchema', () => {
  it('should accept simple AND group', () => {
    const valid = {
      glue: 'and',
      conditions: [
        {
          object: 'deal',
          field_id: 'title',
          operator: '=',
          value: 'Test',
        },
        {
          object: 'deal',
          field_id: 'value',
          operator: '>',
          value: 1000,
        },
      ],
    };
    expect(() => FilterConditionGroupSchema.parse(valid)).not.toThrow();
  });

  it('should accept simple OR group', () => {
    const valid = {
      glue: 'or',
      conditions: [
        {
          object: 'deal',
          field_id: 'status',
          operator: '=',
          value: 'open',
        },
        {
          object: 'deal',
          field_id: 'status',
          operator: '=',
          value: 'won',
        },
      ],
    };
    expect(() => FilterConditionGroupSchema.parse(valid)).not.toThrow();
  });

  it('should accept nested condition groups', () => {
    const valid = {
      glue: 'and',
      conditions: [
        {
          object: 'deal',
          field_id: 'value',
          operator: '>',
          value: 1000,
        },
        {
          glue: 'or',
          conditions: [
            {
              object: 'deal',
              field_id: 'status',
              operator: '=',
              value: 'open',
            },
            {
              object: 'deal',
              field_id: 'status',
              operator: '=',
              value: 'won',
            },
          ],
        },
      ],
    };
    expect(() => FilterConditionGroupSchema.parse(valid)).not.toThrow();
  });

  it('should accept conditions with null values', () => {
    const valid = {
      glue: 'and',
      conditions: [
        {
          object: 'deal',
          field_id: 'title',
          operator: '=',
          value: 'Test',
        },
        null,
      ],
    };
    expect(() => FilterConditionGroupSchema.parse(valid)).not.toThrow();
  });

  it('should accept empty conditions array', () => {
    const valid = {
      glue: 'and',
      conditions: [],
    };
    expect(() => FilterConditionGroupSchema.parse(valid)).not.toThrow();
  });

  it('should reject invalid glue value', () => {
    const invalid = {
      glue: 'xor',
      conditions: [],
    };
    expect(() => FilterConditionGroupSchema.parse(invalid)).toThrow();
  });
});

describe('CreateFilterSchema', () => {
  it('should accept valid filter', () => {
    const valid = {
      name: 'High Value Deals',
      conditions: {
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
      type: 'deals',
    };
    expect(() => CreateFilterSchema.parse(valid)).not.toThrow();
  });

  it('should accept filter with complex conditions', () => {
    const valid = {
      name: 'Complex Filter',
      conditions: {
        glue: 'and',
        conditions: [
          {
            object: 'deal',
            field_id: 'value',
            operator: '>=',
            value: 1000,
          },
          {
            glue: 'or',
            conditions: [
              {
                object: 'deal',
                field_id: 'status',
                operator: '=',
                value: 'open',
              },
              {
                object: 'deal',
                field_id: 'status',
                operator: '=',
                value: 'won',
              },
            ],
          },
        ],
      },
      type: 'deals',
    };
    expect(() => CreateFilterSchema.parse(valid)).not.toThrow();
  });

  it('should accept filter for different types', () => {
    const types = ['deals', 'org', 'people', 'products', 'activities'];
    types.forEach((type) => {
      const valid = {
        name: `${type} filter`,
        conditions: {
          glue: 'and',
          conditions: [],
        },
        type: type as any,
      };
      expect(() => CreateFilterSchema.parse(valid)).not.toThrow();
    });
  });

  it('should reject empty name', () => {
    const invalid = {
      name: '',
      conditions: {
        glue: 'and',
        conditions: [],
      },
      type: 'deals',
    };
    expect(() => CreateFilterSchema.parse(invalid)).toThrow('Name is required and cannot be empty');
  });

  it('should reject name exceeding 255 characters', () => {
    const invalid = {
      name: 'a'.repeat(256),
      conditions: {
        glue: 'and',
        conditions: [],
      },
      type: 'deals',
    };
    expect(() => CreateFilterSchema.parse(invalid)).toThrow('Name cannot exceed 255 characters');
  });

  it('should reject missing type', () => {
    const invalid = {
      name: 'Filter',
      conditions: {
        glue: 'and',
        conditions: [],
      },
    };
    expect(() => CreateFilterSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid type', () => {
    const invalid = {
      name: 'Filter',
      conditions: {
        glue: 'and',
        conditions: [],
      },
      type: 'leads',
    };
    expect(() => CreateFilterSchema.parse(invalid)).toThrow();
  });

  it('should reject extra fields in strict mode', () => {
    const invalid = {
      name: 'Filter',
      conditions: {
        glue: 'and',
        conditions: [],
      },
      type: 'deals',
      extra_field: 'not allowed',
    };
    expect(() => CreateFilterSchema.parse(invalid)).toThrow();
  });
});

describe('UpdateFilterSchema', () => {
  it('should accept valid update with only ID', () => {
    const valid = { id: 1 };
    expect(() => UpdateFilterSchema.parse(valid)).not.toThrow();
  });

  it('should accept update with name', () => {
    const valid = {
      id: 1,
      name: 'Updated Filter Name',
    };
    expect(() => UpdateFilterSchema.parse(valid)).not.toThrow();
  });

  it('should accept update with conditions', () => {
    const valid = {
      id: 1,
      conditions: {
        glue: 'and',
        conditions: [
          {
            object: 'deal',
            field_id: 'value',
            operator: '>',
            value: 5000,
          },
        ],
      },
    };
    expect(() => UpdateFilterSchema.parse(valid)).not.toThrow();
  });

  it('should accept update with both name and conditions', () => {
    const valid = {
      id: 1,
      name: 'Updated Filter',
      conditions: {
        glue: 'or',
        conditions: [],
      },
    };
    expect(() => UpdateFilterSchema.parse(valid)).not.toThrow();
  });

  it('should reject missing ID', () => {
    const invalid = { name: 'Updated Filter' };
    expect(() => UpdateFilterSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid ID', () => {
    const invalid = { id: -1, name: 'Filter' };
    expect(() => UpdateFilterSchema.parse(invalid)).toThrow('ID must be positive');
  });

  it('should reject empty name if provided', () => {
    const invalid = { id: 1, name: '' };
    expect(() => UpdateFilterSchema.parse(invalid)).toThrow('Name cannot be empty');
  });
});

describe('ListFiltersSchema', () => {
  it('should accept valid list request', () => {
    const valid = {};
    expect(() => ListFiltersSchema.parse(valid)).not.toThrow();
  });

  it('should accept list with type filter', () => {
    const valid = { type: 'deals' };
    expect(() => ListFiltersSchema.parse(valid)).not.toThrow();
  });

  it('should accept all valid types', () => {
    const types = ['deals', 'org', 'people', 'products', 'activities'];
    types.forEach((type) => {
      const valid = { type: type as any };
      expect(() => ListFiltersSchema.parse(valid)).not.toThrow();
    });
  });

  it('should reject invalid type', () => {
    const invalid = { type: 'leads' };
    expect(() => ListFiltersSchema.parse(invalid)).toThrow();
  });
});

describe('CreateFilterSchema - Complex Condition Scenarios', () => {
  it('should accept filter with multiple AND conditions', () => {
    const valid = {
      name: 'Multiple AND Filter',
      conditions: {
        glue: 'and',
        conditions: [
          { object: 'deal', field_id: 'value', operator: '>', value: 1000 },
          { object: 'deal', field_id: 'status', operator: '=', value: 'open' },
          { object: 'deal', field_id: 'probability', operator: '>=', value: 50 },
        ],
      },
      type: 'deals',
    };
    expect(() => CreateFilterSchema.parse(valid)).not.toThrow();
  });

  it('should accept filter with IN operator and multiple values', () => {
    const valid = {
      name: 'IN Filter',
      conditions: {
        glue: 'and',
        conditions: [
          {
            object: 'deal',
            field_id: 'stage_id',
            operator: 'IN',
            value: [1, 2, 3, 4, 5],
          },
        ],
      },
      type: 'deals',
    };
    expect(() => CreateFilterSchema.parse(valid)).not.toThrow();
  });

  it('should accept filter with LIKE pattern matching', () => {
    const valid = {
      name: 'Pattern Filter',
      conditions: {
        glue: 'and',
        conditions: [
          {
            object: 'deal',
            field_id: 'title',
            operator: 'LIKE',
            value: '%Enterprise%',
          },
        ],
      },
      type: 'deals',
    };
    expect(() => CreateFilterSchema.parse(valid)).not.toThrow();
  });

  it('should accept filter for people type', () => {
    const valid = {
      name: 'People Filter',
      conditions: {
        glue: 'and',
        conditions: [
          {
            object: 'person',
            field_id: 'name',
            operator: 'LIKE',
            value: 'John%',
          },
        ],
      },
      type: 'people',
    };
    expect(() => CreateFilterSchema.parse(valid)).not.toThrow();
  });

  it('should accept filter for activities type', () => {
    const valid = {
      name: 'Activities Filter',
      conditions: {
        glue: 'and',
        conditions: [
          {
            object: 'activity',
            field_id: 'type',
            operator: '=',
            value: 'call',
          },
          {
            object: 'activity',
            field_id: 'done',
            operator: '=',
            value: false,
          },
        ],
      },
      type: 'activities',
    };
    expect(() => CreateFilterSchema.parse(valid)).not.toThrow();
  });
});
