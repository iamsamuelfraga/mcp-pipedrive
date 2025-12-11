import { describe, it, expect } from 'vitest';
import {
  CreateLeadSchema,
  UpdateLeadSchema,
  ListLeadsSchema,
  SearchLeadsSchema,
  LeadIdSchema,
  LeadValueSchema,
} from '../lead.js';

describe('LeadIdSchema', () => {
  it('should accept valid UUID', () => {
    const validUUIDs = [
      '123e4567-e89b-12d3-a456-426614174000',
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      '550e8400-e29b-41d4-a716-446655440000',
    ];
    validUUIDs.forEach(uuid => {
      expect(() => LeadIdSchema.parse(uuid)).not.toThrow();
    });
  });

  it('should reject invalid UUID format', () => {
    const invalid = 'not-a-uuid';
    expect(() => LeadIdSchema.parse(invalid)).toThrow('Lead ID must be a valid UUID');
  });

  it('should reject UUID with wrong length', () => {
    const invalid = '123e4567-e89b-12d3-a456-42661417400';
    expect(() => LeadIdSchema.parse(invalid)).toThrow('Lead ID must be a valid UUID');
  });

  it('should reject numeric ID', () => {
    expect(() => LeadIdSchema.parse('123')).toThrow('Lead ID must be a valid UUID');
  });

  it('should reject empty string', () => {
    expect(() => LeadIdSchema.parse('')).toThrow();
  });
});

describe('LeadValueSchema', () => {
  it('should accept valid lead value', () => {
    const valid = {
      amount: 5000,
      currency: 'USD',
    };
    expect(() => LeadValueSchema.parse(valid)).not.toThrow();
  });

  it('should convert currency to uppercase', () => {
    const input = {
      amount: 1000,
      currency: 'eur',
    };
    const result = LeadValueSchema.parse(input);
    expect(result.currency).toBe('EUR');
  });

  it('should reject negative amount', () => {
    const invalid = {
      amount: -1000,
      currency: 'USD',
    };
    expect(() => LeadValueSchema.parse(invalid)).toThrow('Amount must be non-negative');
  });

  it('should accept zero amount', () => {
    const valid = {
      amount: 0,
      currency: 'USD',
    };
    expect(() => LeadValueSchema.parse(valid)).not.toThrow();
  });

  it('should reject currency with wrong length', () => {
    const invalid = {
      amount: 1000,
      currency: 'US',
    };
    expect(() => LeadValueSchema.parse(invalid)).toThrow('Currency must be a 3-letter ISO code');
  });
});

describe('CreateLeadSchema', () => {
  it('should accept valid lead with title only', () => {
    const valid = {
      title: 'New Lead',
    };
    expect(() => CreateLeadSchema.parse(valid)).not.toThrow();
  });

  it('should accept lead with all fields', () => {
    const valid = {
      title: 'Complete Lead',
      owner_id: 1,
      label_ids: [
        '123e4567-e89b-12d3-a456-426614174000',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      ],
      person_id: 10,
      organization_id: 20,
      value: {
        amount: 5000,
        currency: 'USD',
      },
      expected_close_date: '2024-12-31',
      visible_to: '3',
      was_seen: true,
      origin_id: 'origin-123',
      channel: 5,
      channel_id: 'channel-abc',
    };
    expect(() => CreateLeadSchema.parse(valid)).not.toThrow();
  });

  it('should reject empty title', () => {
    const invalid = { title: '' };
    expect(() => CreateLeadSchema.parse(invalid)).toThrow('Title is required and cannot be empty');
  });

  it('should reject title exceeding 255 characters', () => {
    const invalid = { title: 'a'.repeat(256) };
    expect(() => CreateLeadSchema.parse(invalid)).toThrow('Title cannot exceed 255 characters');
  });

  it('should reject invalid label_ids UUID', () => {
    const invalid = {
      title: 'Lead',
      label_ids: ['not-a-uuid'],
    };
    expect(() => CreateLeadSchema.parse(invalid)).toThrow('Label ID must be a valid UUID');
  });

  it('should accept empty label_ids array', () => {
    const valid = {
      title: 'Lead',
      label_ids: [],
    };
    expect(() => CreateLeadSchema.parse(valid)).not.toThrow();
  });

  it('should reject invalid expected_close_date format', () => {
    const invalid = {
      title: 'Lead',
      expected_close_date: '12/31/2024',
    };
    expect(() => CreateLeadSchema.parse(invalid)).toThrow('Date must be in YYYY-MM-DD format');
  });

  it('should reject invalid visibility', () => {
    const invalid = {
      title: 'Lead',
      visible_to: '2',
    };
    expect(() => CreateLeadSchema.parse(invalid)).toThrow();
  });

  it('should accept boolean-like values for was_seen', () => {
    const valid1 = { title: 'Lead', was_seen: '1' };
    const valid2 = { title: 'Lead', was_seen: 0 };
    const valid3 = { title: 'Lead', was_seen: true };
    expect(() => CreateLeadSchema.parse(valid1)).not.toThrow();
    expect(() => CreateLeadSchema.parse(valid2)).not.toThrow();
    expect(() => CreateLeadSchema.parse(valid3)).not.toThrow();
  });

  it('should reject non-integer channel', () => {
    const invalid = {
      title: 'Lead',
      channel: 1.5,
    };
    expect(() => CreateLeadSchema.parse(invalid)).toThrow('Channel must be an integer');
  });

  it('should reject invalid lead value', () => {
    const invalid = {
      title: 'Lead',
      value: {
        amount: -1000,
        currency: 'USD',
      },
    };
    expect(() => CreateLeadSchema.parse(invalid)).toThrow();
  });

  it('should reject extra fields in strict mode', () => {
    const invalid = {
      title: 'Lead',
      extra_field: 'not allowed',
    };
    expect(() => CreateLeadSchema.parse(invalid)).toThrow();
  });
});

describe('UpdateLeadSchema', () => {
  it('should accept valid update with only ID', () => {
    const valid = { id: '123e4567-e89b-12d3-a456-426614174000' };
    expect(() => UpdateLeadSchema.parse(valid)).not.toThrow();
  });

  it('should accept update with multiple fields', () => {
    const valid = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Updated Lead',
      owner_id: 2,
      is_archived: true,
    };
    expect(() => UpdateLeadSchema.parse(valid)).not.toThrow();
  });

  it('should accept update with value', () => {
    const valid = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      value: {
        amount: 10000,
        currency: 'EUR',
      },
    };
    expect(() => UpdateLeadSchema.parse(valid)).not.toThrow();
  });

  it('should reject missing ID', () => {
    const invalid = { title: 'Updated Lead' };
    expect(() => UpdateLeadSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid UUID', () => {
    const invalid = { id: 'not-a-uuid', title: 'Lead' };
    expect(() => UpdateLeadSchema.parse(invalid)).toThrow('Lead ID must be a valid UUID');
  });

  it('should reject empty title if provided', () => {
    const invalid = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: '',
    };
    expect(() => UpdateLeadSchema.parse(invalid)).toThrow('Title cannot be empty');
  });

  it('should reject invalid label_ids', () => {
    const invalid = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      label_ids: ['invalid-uuid'],
    };
    expect(() => UpdateLeadSchema.parse(invalid)).toThrow('Label ID must be a valid UUID');
  });
});

describe('ListLeadsSchema', () => {
  it('should accept valid list request with defaults', () => {
    const valid = {};
    const result = ListLeadsSchema.parse(valid);
    expect(result.start).toBe(0);
  });

  it('should accept list with all filters', () => {
    const valid = {
      start: 10,
      limit: 50,
      owner_id: 1,
      person_id: 10,
      organization_id: 20,
      filter_id: 5,
      sort: 'title ASC, value DESC',
    };
    expect(() => ListLeadsSchema.parse(valid)).not.toThrow();
  });

  it('should accept various sort formats', () => {
    const validSorts = [
      'title ASC',
      'value DESC',
      'created_at ASC, updated_at DESC',
      'title',
    ];
    validSorts.forEach(sort => {
      const valid = { sort };
      expect(() => ListLeadsSchema.parse(valid)).not.toThrow();
    });
  });

  it('should reject negative start', () => {
    const invalid = { start: -1 };
    expect(() => ListLeadsSchema.parse(invalid)).toThrow('Start must be non-negative');
  });

  it('should reject limit exceeding 500', () => {
    const invalid = { limit: 501 };
    expect(() => ListLeadsSchema.parse(invalid)).toThrow('Limit cannot exceed 500');
  });
});

describe('SearchLeadsSchema', () => {
  it('should accept valid search with required fields', () => {
    const valid = {
      term: 'Lead Title',
    };
    const result = SearchLeadsSchema.parse(valid);
    expect(result.exact_match).toBe(false);
    expect(result.start).toBe(0);
  });

  it('should accept search with all filters', () => {
    const valid = {
      term: 'Search Term',
      fields: 'title,notes',
      exact_match: true,
      person_id: 10,
      organization_id: 20,
      include_fields: 'id,title,value',
      start: 10,
      limit: 100,
    };
    expect(() => SearchLeadsSchema.parse(valid)).not.toThrow();
  });

  it('should reject search term less than 2 characters', () => {
    const invalid = { term: 'a' };
    expect(() => SearchLeadsSchema.parse(invalid)).toThrow('Search term must be at least 2 characters');
  });

  it('should reject search term exceeding 255 characters', () => {
    const invalid = { term: 'a'.repeat(256) };
    expect(() => SearchLeadsSchema.parse(invalid)).toThrow('Search term cannot exceed 255 characters');
  });

  it('should accept various field combinations', () => {
    const valid = {
      term: 'Search',
      fields: 'title,notes,custom_fields',
    };
    expect(() => SearchLeadsSchema.parse(valid)).not.toThrow();
  });

  it('should reject negative start', () => {
    const invalid = { term: 'Search', start: -1 };
    expect(() => SearchLeadsSchema.parse(invalid)).toThrow('Start must be non-negative');
  });

  it('should reject limit exceeding 500', () => {
    const invalid = { term: 'Search', limit: 501 };
    expect(() => SearchLeadsSchema.parse(invalid)).toThrow('Limit cannot exceed 500');
  });
});

describe('CreateLeadSchema - UUID Validation', () => {
  it('should accept multiple valid label UUIDs', () => {
    const valid = {
      title: 'Lead',
      label_ids: [
        '123e4567-e89b-12d3-a456-426614174000',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        '550e8400-e29b-41d4-a716-446655440000',
      ],
    };
    expect(() => CreateLeadSchema.parse(valid)).not.toThrow();
  });

  it('should reject mixed valid and invalid UUIDs', () => {
    const invalid = {
      title: 'Lead',
      label_ids: [
        '123e4567-e89b-12d3-a456-426614174000',
        'not-a-uuid',
      ],
    };
    expect(() => CreateLeadSchema.parse(invalid)).toThrow('Label ID must be a valid UUID');
  });

  it('should reject all invalid UUIDs', () => {
    const invalid = {
      title: 'Lead',
      label_ids: ['invalid-1', 'invalid-2', 'invalid-3'],
    };
    expect(() => CreateLeadSchema.parse(invalid)).toThrow();
  });
});

describe('CreateLeadSchema - Value Scenarios', () => {
  it('should accept lead with USD value', () => {
    const valid = {
      title: 'US Lead',
      value: {
        amount: 50000,
        currency: 'USD',
      },
    };
    expect(() => CreateLeadSchema.parse(valid)).not.toThrow();
  });

  it('should accept lead with EUR value', () => {
    const valid = {
      title: 'EU Lead',
      value: {
        amount: 45000,
        currency: 'EUR',
      },
    };
    expect(() => CreateLeadSchema.parse(valid)).not.toThrow();
  });

  it('should accept lead with decimal amount', () => {
    const valid = {
      title: 'Precise Lead',
      value: {
        amount: 1234.56,
        currency: 'USD',
      },
    };
    expect(() => CreateLeadSchema.parse(valid)).not.toThrow();
  });

  it('should accept lead with zero value', () => {
    const valid = {
      title: 'Zero Value Lead',
      value: {
        amount: 0,
        currency: 'USD',
      },
    };
    expect(() => CreateLeadSchema.parse(valid)).not.toThrow();
  });
});
