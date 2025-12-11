import { describe, it, expect } from 'vitest';
import {
  CreatePersonSchema,
  UpdatePersonSchema,
  ListPersonsSchema,
  SearchPersonsSchema,
  MergePersonsSchema,
} from '../person.js';

describe('CreatePersonSchema', () => {
  it('should accept valid person with name only', () => {
    const valid = {
      name: 'John Doe',
    };
    expect(() => CreatePersonSchema.parse(valid)).not.toThrow();
  });

  it('should accept person with email array', () => {
    const valid = {
      name: 'Jane Smith',
      email: [
        { value: 'jane@example.com', primary: true, label: 'work' },
        { value: 'jane.personal@example.com', primary: false, label: 'personal' },
      ],
    };
    expect(() => CreatePersonSchema.parse(valid)).not.toThrow();
  });

  it('should accept person with phone array', () => {
    const valid = {
      name: 'Bob Johnson',
      phone: [
        { value: '+1-555-0123', primary: true, label: 'mobile' },
        { value: '+1-555-0124', primary: false, label: 'work' },
      ],
    };
    expect(() => CreatePersonSchema.parse(valid)).not.toThrow();
  });

  it('should accept person with all fields', () => {
    const valid = {
      name: 'Alice Cooper',
      owner_id: 1,
      org_id: 10,
      email: [{ value: 'alice@example.com' }],
      phone: [{ value: '+1-555-0125' }],
      visible_to: '3',
      marketing_status: 'subscribed',
    };
    expect(() => CreatePersonSchema.parse(valid)).not.toThrow();
  });

  it('should reject empty name', () => {
    const invalid = { name: '' };
    expect(() => CreatePersonSchema.parse(invalid)).toThrow('Name is required and cannot be empty');
  });

  it('should reject name exceeding 255 characters', () => {
    const invalid = { name: 'a'.repeat(256) };
    expect(() => CreatePersonSchema.parse(invalid)).toThrow('Name cannot exceed 255 characters');
  });

  it('should reject invalid email format', () => {
    const invalid = {
      name: 'John Doe',
      email: [{ value: 'not-an-email' }],
    };
    expect(() => CreatePersonSchema.parse(invalid)).toThrow('Invalid email format');
  });

  it('should reject empty email array', () => {
    const invalid = {
      name: 'John Doe',
      email: [],
    };
    expect(() => CreatePersonSchema.parse(invalid)).toThrow('At least one email is required');
  });

  it('should reject empty phone array', () => {
    const invalid = {
      name: 'John Doe',
      phone: [],
    };
    expect(() => CreatePersonSchema.parse(invalid)).toThrow('At least one phone number is required');
  });

  it('should reject empty phone value', () => {
    const invalid = {
      name: 'John Doe',
      phone: [{ value: '' }],
    };
    expect(() => CreatePersonSchema.parse(invalid)).toThrow('Phone number cannot be empty');
  });

  it('should reject invalid visibility', () => {
    const invalid = {
      name: 'John Doe',
      visible_to: '2',
    };
    expect(() => CreatePersonSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid marketing status', () => {
    const invalid = {
      name: 'John Doe',
      marketing_status: 'opt-in',
    };
    expect(() => CreatePersonSchema.parse(invalid)).toThrow('Marketing status must be one of: no_consent, unsubscribed, subscribed, archived');
  });

  it('should reject extra fields in strict mode', () => {
    const invalid = {
      name: 'John Doe',
      extra_field: 'not allowed',
    };
    expect(() => CreatePersonSchema.parse(invalid)).toThrow();
  });
});

describe('UpdatePersonSchema', () => {
  it('should accept valid update with only ID', () => {
    const valid = { id: 1 };
    expect(() => UpdatePersonSchema.parse(valid)).not.toThrow();
  });

  it('should accept update with multiple fields', () => {
    const valid = {
      id: 1,
      name: 'Updated Name',
      email: [{ value: 'updated@example.com' }],
      phone: [{ value: '+1-555-9999' }],
    };
    expect(() => UpdatePersonSchema.parse(valid)).not.toThrow();
  });

  it('should reject missing ID', () => {
    const invalid = { name: 'John Doe' };
    expect(() => UpdatePersonSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid ID', () => {
    const invalid = { id: -1 };
    expect(() => UpdatePersonSchema.parse(invalid)).toThrow('ID must be positive');
  });

  it('should reject empty name if provided', () => {
    const invalid = { id: 1, name: '' };
    expect(() => UpdatePersonSchema.parse(invalid)).toThrow('Name cannot be empty');
  });

  it('should reject invalid email in update', () => {
    const invalid = {
      id: 1,
      email: [{ value: 'invalid-email' }],
    };
    expect(() => UpdatePersonSchema.parse(invalid)).toThrow('Invalid email format');
  });
});

describe('ListPersonsSchema', () => {
  it('should accept valid list request with defaults', () => {
    const valid = {};
    const result = ListPersonsSchema.parse(valid);
    expect(result.start).toBe(0);
  });

  it('should accept list with all filters', () => {
    const valid = {
      start: 10,
      limit: 50,
      user_id: 1,
      org_id: 10,
      filter_id: 5,
      first_char: 'A',
      sort: 'name',
      sort_by: 'desc',
    };
    expect(() => ListPersonsSchema.parse(valid)).not.toThrow();
  });

  it('should reject first_char with multiple characters', () => {
    const invalid = { first_char: 'AB' };
    expect(() => ListPersonsSchema.parse(invalid)).toThrow('First char must be a single character');
  });

  it('should reject first_char with non-letter', () => {
    const invalid = { first_char: '1' };
    expect(() => ListPersonsSchema.parse(invalid)).toThrow('First char must be a letter');
  });

  it('should accept uppercase first_char', () => {
    const valid = { first_char: 'Z' };
    expect(() => ListPersonsSchema.parse(valid)).not.toThrow();
  });

  it('should accept lowercase first_char', () => {
    const valid = { first_char: 'a' };
    expect(() => ListPersonsSchema.parse(valid)).not.toThrow();
  });

  it('should reject negative start', () => {
    const invalid = { start: -1 };
    expect(() => ListPersonsSchema.parse(invalid)).toThrow('Start must be non-negative');
  });

  it('should reject limit exceeding 500', () => {
    const invalid = { limit: 501 };
    expect(() => ListPersonsSchema.parse(invalid)).toThrow('Limit cannot exceed 500');
  });
});

describe('SearchPersonsSchema', () => {
  it('should accept valid search with required fields', () => {
    const valid = {
      term: 'John',
    };
    const result = SearchPersonsSchema.parse(valid);
    expect(result.fields).toBe('all');
    expect(result.exact_match).toBe(false);
    expect(result.start).toBe(0);
  });

  it('should accept search with all filters', () => {
    const valid = {
      term: 'Search Term',
      fields: 'email',
      exact_match: true,
      org_id: 10,
      include_fields: 'id,name,email',
      start: 10,
      limit: 100,
    };
    expect(() => SearchPersonsSchema.parse(valid)).not.toThrow();
  });

  it('should reject search term less than 2 characters', () => {
    const invalid = { term: 'a' };
    expect(() => SearchPersonsSchema.parse(invalid)).toThrow('Search term must be at least 2 characters');
  });

  it('should reject search term exceeding 255 characters', () => {
    const invalid = { term: 'a'.repeat(256) };
    expect(() => SearchPersonsSchema.parse(invalid)).toThrow('Search term cannot exceed 255 characters');
  });

  it('should reject invalid fields enum', () => {
    const invalid = { term: 'Search', fields: 'address' };
    expect(() => SearchPersonsSchema.parse(invalid)).toThrow('Fields must be one of: name, email, phone, notes, custom_fields, all');
  });

  it('should accept all valid field types', () => {
    const validFields = ['name', 'email', 'phone', 'notes', 'custom_fields', 'all'];
    validFields.forEach(field => {
      const valid = { term: 'Search', fields: field as any };
      expect(() => SearchPersonsSchema.parse(valid)).not.toThrow();
    });
  });
});

describe('MergePersonsSchema', () => {
  it('should accept valid merge with different IDs', () => {
    const valid = {
      id: 1,
      merge_with_id: 2,
    };
    expect(() => MergePersonsSchema.parse(valid)).not.toThrow();
  });

  it('should reject merging person with itself', () => {
    const invalid = {
      id: 1,
      merge_with_id: 1,
    };
    expect(() => MergePersonsSchema.parse(invalid)).toThrow('Cannot merge a person with itself');
  });

  it('should reject missing id', () => {
    const invalid = { merge_with_id: 2 };
    expect(() => MergePersonsSchema.parse(invalid)).toThrow();
  });

  it('should reject missing merge_with_id', () => {
    const invalid = { id: 1 };
    expect(() => MergePersonsSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid IDs', () => {
    const invalid1 = { id: 0, merge_with_id: 2 };
    const invalid2 = { id: 1, merge_with_id: -1 };
    expect(() => MergePersonsSchema.parse(invalid1)).toThrow();
    expect(() => MergePersonsSchema.parse(invalid2)).toThrow();
  });
});

describe('CreatePersonSchema - Email Edge Cases', () => {
  it('should accept single email in array', () => {
    const valid = {
      name: 'Test User',
      email: [{ value: 'test@example.com' }],
    };
    expect(() => CreatePersonSchema.parse(valid)).not.toThrow();
  });

  it('should accept multiple emails with different labels', () => {
    const valid = {
      name: 'Test User',
      email: [
        { value: 'work@example.com', label: 'work', primary: true },
        { value: 'personal@example.com', label: 'personal', primary: false },
        { value: 'other@example.com', label: 'other' },
      ],
    };
    expect(() => CreatePersonSchema.parse(valid)).not.toThrow();
  });

  it('should reject duplicate invalid emails', () => {
    const invalid = {
      name: 'Test User',
      email: [
        { value: 'invalid-email-1' },
        { value: 'invalid-email-2' },
      ],
    };
    expect(() => CreatePersonSchema.parse(invalid)).toThrow();
  });

  it('should handle complex email addresses', () => {
    const valid = {
      name: 'Test User',
      email: [
        { value: 'user+tag@example.co.uk' },
        { value: 'first.last@sub.domain.com' },
      ],
    };
    expect(() => CreatePersonSchema.parse(valid)).not.toThrow();
  });
});

describe('CreatePersonSchema - Phone Edge Cases', () => {
  it('should accept various phone formats', () => {
    const valid = {
      name: 'Test User',
      phone: [
        { value: '+1-555-0123' },
        { value: '(555) 555-5555' },
        { value: '555.555.5555' },
        { value: '5555555555' },
      ],
    };
    expect(() => CreatePersonSchema.parse(valid)).not.toThrow();
  });

  it('should accept international phone numbers', () => {
    const valid = {
      name: 'Test User',
      phone: [
        { value: '+44 20 7946 0958' },
        { value: '+81 3-1234-5678' },
        { value: '+86 10 1234 5678' },
      ],
    };
    expect(() => CreatePersonSchema.parse(valid)).not.toThrow();
  });
});
