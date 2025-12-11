import { describe, it, expect } from 'vitest';
import {
  CreateDealSchema,
  UpdateDealSchema,
  ListDealsSchema,
  SearchDealsSchema,
  MoveDealStageSchema,
  AddDealProductSchema,
  BulkEditDealsSchema,
  MarkDealAsLostSchema,
} from '../deal.js';

describe('CreateDealSchema', () => {
  it('should accept valid deal with required fields only', () => {
    const validDeal = {
      title: 'New Deal',
    };
    expect(() => CreateDealSchema.parse(validDeal)).not.toThrow();
  });

  it('should accept deal with all fields', () => {
    const validDeal = {
      title: 'Complete Deal',
      value: 5000,
      currency: 'USD',
      user_id: 1,
      person_id: 10,
      org_id: 20,
      pipeline_id: 5,
      stage_id: 15,
      status: 'open',
      expected_close_date: '2024-12-31',
      probability: 75,
      visible_to: '3',
    };
    expect(() => CreateDealSchema.parse(validDeal)).not.toThrow();
  });

  it('should use default status', () => {
    const deal = { title: 'Test Deal' };
    const result = CreateDealSchema.parse(deal);
    expect(result.status).toBe('open');
  });

  it('should reject empty title', () => {
    const invalid = { title: '' };
    expect(() => CreateDealSchema.parse(invalid)).toThrow('Title is required and cannot be empty');
  });

  it('should reject title exceeding 255 characters', () => {
    const invalid = { title: 'a'.repeat(256) };
    expect(() => CreateDealSchema.parse(invalid)).toThrow('Title cannot exceed 255 characters');
  });

  it('should reject negative value', () => {
    const invalid = {
      title: 'Deal',
      value: -100,
    };
    expect(() => CreateDealSchema.parse(invalid)).toThrow('Value must be non-negative');
  });

  it('should reject invalid currency code', () => {
    const invalid = {
      title: 'Deal',
      currency: 'US',
    };
    expect(() => CreateDealSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid status', () => {
    const invalid = {
      title: 'Deal',
      status: 'pending',
    };
    expect(() => CreateDealSchema.parse(invalid)).toThrow('Status must be one of: open, won, lost');
  });

  it('should reject probability below 0', () => {
    const invalid = {
      title: 'Deal',
      probability: -1,
    };
    expect(() => CreateDealSchema.parse(invalid)).toThrow('Probability must be between 0 and 100');
  });

  it('should reject probability above 100', () => {
    const invalid = {
      title: 'Deal',
      probability: 101,
    };
    expect(() => CreateDealSchema.parse(invalid)).toThrow('Probability must be between 0 and 100');
  });

  it('should accept probability at boundaries', () => {
    const valid1 = { title: 'Deal', probability: 0 };
    const valid2 = { title: 'Deal', probability: 100 };
    expect(() => CreateDealSchema.parse(valid1)).not.toThrow();
    expect(() => CreateDealSchema.parse(valid2)).not.toThrow();
  });

  it('should reject invalid date format', () => {
    const invalid = {
      title: 'Deal',
      expected_close_date: '12/31/2024',
    };
    expect(() => CreateDealSchema.parse(invalid)).toThrow('Date must be in YYYY-MM-DD format');
  });

  it('should reject extra fields in strict mode', () => {
    const invalid = {
      title: 'Deal',
      extra_field: 'not allowed',
    };
    expect(() => CreateDealSchema.parse(invalid)).toThrow();
  });

  it('should reject lost_reason exceeding 255 characters', () => {
    const invalid = {
      title: 'Deal',
      lost_reason: 'a'.repeat(256),
    };
    expect(() => CreateDealSchema.parse(invalid)).toThrow('Lost reason cannot exceed 255 characters');
  });
});

describe('UpdateDealSchema', () => {
  it('should accept valid update with only ID', () => {
    const valid = { id: 1 };
    expect(() => UpdateDealSchema.parse(valid)).not.toThrow();
  });

  it('should accept update with multiple fields', () => {
    const valid = {
      id: 1,
      title: 'Updated Deal',
      value: 10000,
      status: 'won',
    };
    expect(() => UpdateDealSchema.parse(valid)).not.toThrow();
  });

  it('should reject missing ID', () => {
    const invalid = { title: 'Updated Deal' };
    expect(() => UpdateDealSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid ID', () => {
    const invalid = { id: -1, title: 'Deal' };
    expect(() => UpdateDealSchema.parse(invalid)).toThrow('ID must be positive');
  });

  it('should reject empty title if provided', () => {
    const invalid = { id: 1, title: '' };
    expect(() => UpdateDealSchema.parse(invalid)).toThrow('Title cannot be empty');
  });

  it('should reject negative value', () => {
    const invalid = { id: 1, value: -100 };
    expect(() => UpdateDealSchema.parse(invalid)).toThrow('Value must be non-negative');
  });
});

describe('ListDealsSchema', () => {
  it('should accept valid list request with defaults', () => {
    const valid = {};
    const result = ListDealsSchema.parse(valid);
    expect(result.start).toBe(0);
    expect(result.status).toBe('all_not_deleted');
  });

  it('should accept list with all filters', () => {
    const valid = {
      start: 10,
      limit: 50,
      status: 'open',
      stage_id: 5,
      user_id: 1,
      person_id: 10,
      org_id: 20,
      pipeline_id: 3,
      filter_id: 7,
      sort: 'title',
      sort_by: 'asc',
      owned_by_you: true,
    };
    expect(() => ListDealsSchema.parse(valid)).not.toThrow();
  });

  it('should accept boolean-like values for owned_by_you', () => {
    const valid1 = { owned_by_you: '1' };
    const valid2 = { owned_by_you: 0 };
    const valid3 = { owned_by_you: true };
    expect(() => ListDealsSchema.parse(valid1)).not.toThrow();
    expect(() => ListDealsSchema.parse(valid2)).not.toThrow();
    expect(() => ListDealsSchema.parse(valid3)).not.toThrow();
  });

  it('should reject invalid status', () => {
    const invalid = { status: 'pending' };
    expect(() => ListDealsSchema.parse(invalid)).toThrow();
  });

  it('should reject negative start', () => {
    const invalid = { start: -1 };
    expect(() => ListDealsSchema.parse(invalid)).toThrow('Start must be non-negative');
  });

  it('should reject limit exceeding 500', () => {
    const invalid = { limit: 501 };
    expect(() => ListDealsSchema.parse(invalid)).toThrow('Limit cannot exceed 500');
  });
});

describe('SearchDealsSchema', () => {
  it('should accept valid search with required fields', () => {
    const valid = {
      term: 'Deal Title',
    };
    const result = SearchDealsSchema.parse(valid);
    expect(result.fields).toBe('all');
    expect(result.exact_match).toBe(false);
    expect(result.start).toBe(0);
  });

  it('should accept search with all filters', () => {
    const valid = {
      term: 'Search Term',
      fields: 'title',
      exact_match: true,
      person_id: 10,
      org_id: 20,
      status: 'open',
      include_fields: 'id,title,value',
      start: 10,
      limit: 100,
    };
    expect(() => SearchDealsSchema.parse(valid)).not.toThrow();
  });

  it('should reject search term less than 2 characters', () => {
    const invalid = { term: 'a' };
    expect(() => SearchDealsSchema.parse(invalid)).toThrow('Search term must be at least 2 characters');
  });

  it('should reject search term exceeding 255 characters', () => {
    const invalid = { term: 'a'.repeat(256) };
    expect(() => SearchDealsSchema.parse(invalid)).toThrow('Search term cannot exceed 255 characters');
  });

  it('should reject invalid fields enum', () => {
    const invalid = { term: 'Search', fields: 'invalid' };
    expect(() => SearchDealsSchema.parse(invalid)).toThrow('Fields must be one of: title, notes, custom_fields, all');
  });

  it('should reject invalid status', () => {
    const invalid = { term: 'Search', status: 'pending' };
    expect(() => SearchDealsSchema.parse(invalid)).toThrow();
  });
});

describe('MoveDealStageSchema', () => {
  it('should accept valid move request', () => {
    const valid = {
      id: 1,
      stage_id: 5,
    };
    expect(() => MoveDealStageSchema.parse(valid)).not.toThrow();
  });

  it('should reject missing ID', () => {
    const invalid = { stage_id: 5 };
    expect(() => MoveDealStageSchema.parse(invalid)).toThrow();
  });

  it('should reject missing stage_id', () => {
    const invalid = { id: 1 };
    expect(() => MoveDealStageSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid IDs', () => {
    const invalid1 = { id: 0, stage_id: 5 };
    const invalid2 = { id: 1, stage_id: -1 };
    expect(() => MoveDealStageSchema.parse(invalid1)).toThrow();
    expect(() => MoveDealStageSchema.parse(invalid2)).toThrow();
  });
});

describe('AddDealProductSchema', () => {
  it('should accept valid product addition', () => {
    const valid = {
      id: 1,
      product_id: 10,
    };
    const result = AddDealProductSchema.parse(valid);
    expect(result.quantity).toBe(1);
    expect(result.discount_percentage).toBe(0);
    expect(result.enabled_flag).toBe(true);
  });

  it('should accept product with all fields', () => {
    const valid = {
      id: 1,
      product_id: 10,
      item_price: 100,
      quantity: 5,
      discount_percentage: 10,
      duration: 12,
      product_variation_id: 3,
      comments: 'Special pricing',
      enabled_flag: true,
    };
    expect(() => AddDealProductSchema.parse(valid)).not.toThrow();
  });

  it('should reject negative price', () => {
    const invalid = {
      id: 1,
      product_id: 10,
      item_price: -100,
    };
    expect(() => AddDealProductSchema.parse(invalid)).toThrow('Price must be non-negative');
  });

  it('should reject zero quantity', () => {
    const invalid = {
      id: 1,
      product_id: 10,
      quantity: 0,
    };
    expect(() => AddDealProductSchema.parse(invalid)).toThrow('Quantity must be positive');
  });

  it('should reject non-integer quantity', () => {
    const invalid = {
      id: 1,
      product_id: 10,
      quantity: 2.5,
    };
    expect(() => AddDealProductSchema.parse(invalid)).toThrow('Quantity must be an integer');
  });

  it('should reject discount below 0', () => {
    const invalid = {
      id: 1,
      product_id: 10,
      discount_percentage: -1,
    };
    expect(() => AddDealProductSchema.parse(invalid)).toThrow('Discount must be between 0 and 100');
  });

  it('should reject discount above 100', () => {
    const invalid = {
      id: 1,
      product_id: 10,
      discount_percentage: 101,
    };
    expect(() => AddDealProductSchema.parse(invalid)).toThrow('Discount must be between 0 and 100');
  });

  it('should reject comments exceeding 1000 characters', () => {
    const invalid = {
      id: 1,
      product_id: 10,
      comments: 'a'.repeat(1001),
    };
    expect(() => AddDealProductSchema.parse(invalid)).toThrow('Comments cannot exceed 1000 characters');
  });
});

describe('BulkEditDealsSchema', () => {
  it('should accept valid bulk edit', () => {
    const valid = {
      ids: [1, 2, 3],
      value: 1000,
      status: 'won',
    };
    expect(() => BulkEditDealsSchema.parse(valid)).not.toThrow();
  });

  it('should reject empty IDs array', () => {
    const invalid = {
      ids: [],
      value: 1000,
    };
    expect(() => BulkEditDealsSchema.parse(invalid)).toThrow('At least one deal ID is required');
  });

  it('should reject invalid IDs in array', () => {
    const invalid = {
      ids: [1, -2, 3],
      value: 1000,
    };
    expect(() => BulkEditDealsSchema.parse(invalid)).toThrow();
  });

  it('should reject negative value', () => {
    const invalid = {
      ids: [1, 2],
      value: -100,
    };
    expect(() => BulkEditDealsSchema.parse(invalid)).toThrow('Value must be non-negative');
  });

  it('should reject invalid status', () => {
    const invalid = {
      ids: [1, 2],
      status: 'pending',
    };
    expect(() => BulkEditDealsSchema.parse(invalid)).toThrow();
  });
});

describe('MarkDealAsLostSchema', () => {
  it('should accept valid mark as lost', () => {
    const valid = {
      id: 1,
      lost_reason: 'Price too high',
    };
    expect(() => MarkDealAsLostSchema.parse(valid)).not.toThrow();
  });

  it('should accept without lost_reason', () => {
    const valid = { id: 1 };
    expect(() => MarkDealAsLostSchema.parse(valid)).not.toThrow();
  });

  it('should reject lost_reason exceeding 255 characters', () => {
    const invalid = {
      id: 1,
      lost_reason: 'a'.repeat(256),
    };
    expect(() => MarkDealAsLostSchema.parse(invalid)).toThrow('Lost reason cannot exceed 255 characters');
  });
});
