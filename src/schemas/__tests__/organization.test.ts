import { describe, it, expect } from 'vitest';
import {
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
  ListOrganizationsSchema,
  SearchOrganizationsSchema,
  MergeOrganizationsSchema,
  BulkDeleteOrganizationsSchema,
} from '../organization.js';

describe('CreateOrganizationSchema', () => {
  it('should accept valid organization with name only', () => {
    const valid = {
      name: 'Acme Corporation',
    };
    expect(() => CreateOrganizationSchema.parse(valid)).not.toThrow();
  });

  it('should accept organization with all address fields', () => {
    const valid = {
      name: 'Tech Company Inc',
      address: '123 Main Street',
      address_subpremise: 'Suite 100',
      address_street_number: '123',
      address_route: 'Main Street',
      address_sublocality: 'Downtown',
      address_locality: 'San Francisco',
      address_admin_area_level_1: 'California',
      address_admin_area_level_2: 'San Francisco County',
      address_country: 'United States',
      address_postal_code: '94102',
      address_formatted_address: '123 Main Street, Suite 100, San Francisco, CA 94102, USA',
    };
    expect(() => CreateOrganizationSchema.parse(valid)).not.toThrow();
  });

  it('should accept organization with owner and visibility', () => {
    const valid = {
      name: 'Business LLC',
      owner_id: 1,
      visible_to: '3',
      label: 5,
    };
    expect(() => CreateOrganizationSchema.parse(valid)).not.toThrow();
  });

  it('should reject empty name', () => {
    const invalid = { name: '' };
    expect(() => CreateOrganizationSchema.parse(invalid)).toThrow(
      'Name is required and cannot be empty'
    );
  });

  it('should reject name exceeding 255 characters', () => {
    const invalid = { name: 'a'.repeat(256) };
    expect(() => CreateOrganizationSchema.parse(invalid)).toThrow(
      'Name cannot exceed 255 characters'
    );
  });

  it('should reject address exceeding 255 characters', () => {
    const invalid = {
      name: 'Company',
      address: 'a'.repeat(256),
    };
    expect(() => CreateOrganizationSchema.parse(invalid)).toThrow(
      'Address cannot exceed 255 characters'
    );
  });

  it('should reject postal_code exceeding 50 characters', () => {
    const invalid = {
      name: 'Company',
      address_postal_code: 'a'.repeat(51),
    };
    expect(() => CreateOrganizationSchema.parse(invalid)).toThrow(
      'Postal code cannot exceed 50 characters'
    );
  });

  it('should reject formatted_address exceeding 500 characters', () => {
    const invalid = {
      name: 'Company',
      address_formatted_address: 'a'.repeat(501),
    };
    expect(() => CreateOrganizationSchema.parse(invalid)).toThrow(
      'Formatted address cannot exceed 500 characters'
    );
  });

  it('should reject invalid visibility', () => {
    const invalid = {
      name: 'Company',
      visible_to: '4',
    };
    expect(() => CreateOrganizationSchema.parse(invalid)).toThrow();
  });

  it('should reject extra fields in strict mode', () => {
    const invalid = {
      name: 'Company',
      extra_field: 'not allowed',
    };
    expect(() => CreateOrganizationSchema.parse(invalid)).toThrow();
  });
});

describe('UpdateOrganizationSchema', () => {
  it('should accept valid update with only ID', () => {
    const valid = { id: 1 };
    expect(() => UpdateOrganizationSchema.parse(valid)).not.toThrow();
  });

  it('should accept update with multiple fields', () => {
    const valid = {
      id: 1,
      name: 'Updated Company Name',
      address: 'New Address',
      owner_id: 2,
    };
    expect(() => UpdateOrganizationSchema.parse(valid)).not.toThrow();
  });

  it('should accept update with address fields', () => {
    const valid = {
      id: 1,
      address_locality: 'New York',
      address_admin_area_level_1: 'New York',
      address_postal_code: '10001',
    };
    expect(() => UpdateOrganizationSchema.parse(valid)).not.toThrow();
  });

  it('should reject missing ID', () => {
    const invalid = { name: 'Updated Name' };
    expect(() => UpdateOrganizationSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid ID', () => {
    const invalid = { id: -1 };
    expect(() => UpdateOrganizationSchema.parse(invalid)).toThrow('ID must be positive');
  });

  it('should reject empty name if provided', () => {
    const invalid = { id: 1, name: '' };
    expect(() => UpdateOrganizationSchema.parse(invalid)).toThrow('Name cannot be empty');
  });
});

describe('ListOrganizationsSchema', () => {
  it('should accept valid list request with defaults', () => {
    const valid = {};
    const result = ListOrganizationsSchema.parse(valid);
    expect(result.start).toBe(0);
  });

  it('should accept list with all filters', () => {
    const valid = {
      start: 10,
      limit: 50,
      user_id: 1,
      filter_id: 5,
      first_char: 'A',
      sort: 'name',
      sort_by: 'asc',
    };
    expect(() => ListOrganizationsSchema.parse(valid)).not.toThrow();
  });

  it('should reject first_char with multiple characters', () => {
    const invalid = { first_char: 'AB' };
    expect(() => ListOrganizationsSchema.parse(invalid)).toThrow(
      'First char must be a single character'
    );
  });

  it('should reject first_char with number', () => {
    const invalid = { first_char: '5' };
    expect(() => ListOrganizationsSchema.parse(invalid)).toThrow('First char must be a letter');
  });

  it('should accept both uppercase and lowercase first_char', () => {
    const valid1 = { first_char: 'Z' };
    const valid2 = { first_char: 'z' };
    expect(() => ListOrganizationsSchema.parse(valid1)).not.toThrow();
    expect(() => ListOrganizationsSchema.parse(valid2)).not.toThrow();
  });

  it('should reject negative start', () => {
    const invalid = { start: -1 };
    expect(() => ListOrganizationsSchema.parse(invalid)).toThrow('Start must be non-negative');
  });

  it('should reject limit exceeding 500', () => {
    const invalid = { limit: 501 };
    expect(() => ListOrganizationsSchema.parse(invalid)).toThrow('Limit cannot exceed 500');
  });
});

describe('SearchOrganizationsSchema', () => {
  it('should accept valid search with required fields', () => {
    const valid = {
      term: 'Acme',
    };
    const result = SearchOrganizationsSchema.parse(valid);
    expect(result.fields).toBe('all');
    expect(result.exact_match).toBe(false);
    expect(result.start).toBe(0);
  });

  it('should accept search with all filters', () => {
    const valid = {
      term: 'Search Term',
      fields: 'name',
      exact_match: true,
      include_fields: 'id,name,address',
      start: 10,
      limit: 100,
    };
    expect(() => SearchOrganizationsSchema.parse(valid)).not.toThrow();
  });

  it('should reject search term less than 2 characters', () => {
    const invalid = { term: 'A' };
    expect(() => SearchOrganizationsSchema.parse(invalid)).toThrow(
      'Search term must be at least 2 characters'
    );
  });

  it('should reject search term exceeding 255 characters', () => {
    const invalid = { term: 'a'.repeat(256) };
    expect(() => SearchOrganizationsSchema.parse(invalid)).toThrow(
      'Search term cannot exceed 255 characters'
    );
  });

  it('should reject invalid fields enum', () => {
    const invalid = { term: 'Search', fields: 'email' };
    expect(() => SearchOrganizationsSchema.parse(invalid)).toThrow(
      'Fields must be one of: name, address, notes, custom_fields, all'
    );
  });

  it('should accept all valid field types', () => {
    const validFields = ['name', 'address', 'notes', 'custom_fields', 'all'];
    validFields.forEach((field) => {
      const valid = { term: 'Search', fields: field as any };
      expect(() => SearchOrganizationsSchema.parse(valid)).not.toThrow();
    });
  });
});

describe('MergeOrganizationsSchema', () => {
  it('should accept valid merge with different IDs', () => {
    const valid = {
      id: 1,
      merge_with_id: 2,
    };
    expect(() => MergeOrganizationsSchema.parse(valid)).not.toThrow();
  });

  it('should reject merging organization with itself', () => {
    const invalid = {
      id: 1,
      merge_with_id: 1,
    };
    expect(() => MergeOrganizationsSchema.parse(invalid)).toThrow(
      'Cannot merge an organization with itself'
    );
  });

  it('should reject missing id', () => {
    const invalid = { merge_with_id: 2 };
    expect(() => MergeOrganizationsSchema.parse(invalid)).toThrow();
  });

  it('should reject missing merge_with_id', () => {
    const invalid = { id: 1 };
    expect(() => MergeOrganizationsSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid IDs', () => {
    const invalid1 = { id: 0, merge_with_id: 2 };
    const invalid2 = { id: 1, merge_with_id: -1 };
    expect(() => MergeOrganizationsSchema.parse(invalid1)).toThrow();
    expect(() => MergeOrganizationsSchema.parse(invalid2)).toThrow();
  });
});

describe('BulkDeleteOrganizationsSchema', () => {
  it('should accept valid comma-separated IDs', () => {
    const valid = { ids: '1,2,3,4,5' };
    expect(() => BulkDeleteOrganizationsSchema.parse(valid)).not.toThrow();
  });

  it('should accept single ID', () => {
    const valid = { ids: '1' };
    expect(() => BulkDeleteOrganizationsSchema.parse(valid)).not.toThrow();
  });

  it('should reject IDs with spaces', () => {
    const invalid = { ids: '1, 2, 3' };
    expect(() => BulkDeleteOrganizationsSchema.parse(invalid)).toThrow(
      'IDs must be a comma-separated list of numbers'
    );
  });

  it('should reject IDs with letters', () => {
    const invalid = { ids: '1,2,abc' };
    expect(() => BulkDeleteOrganizationsSchema.parse(invalid)).toThrow(
      'IDs must be a comma-separated list of numbers'
    );
  });

  it('should reject empty string', () => {
    const invalid = { ids: '' };
    expect(() => BulkDeleteOrganizationsSchema.parse(invalid)).toThrow();
  });

  it('should reject IDs with trailing comma', () => {
    const invalid = { ids: '1,2,3,' };
    expect(() => BulkDeleteOrganizationsSchema.parse(invalid)).toThrow(
      'IDs must be a comma-separated list of numbers'
    );
  });

  it('should reject IDs with leading comma', () => {
    const invalid = { ids: ',1,2,3' };
    expect(() => BulkDeleteOrganizationsSchema.parse(invalid)).toThrow(
      'IDs must be a comma-separated list of numbers'
    );
  });
});

describe('CreateOrganizationSchema - Address Edge Cases', () => {
  it('should accept minimal address', () => {
    const valid = {
      name: 'Company',
      address_locality: 'New York',
      address_postal_code: '10001',
    };
    expect(() => CreateOrganizationSchema.parse(valid)).not.toThrow();
  });

  it('should accept international address', () => {
    const valid = {
      name: 'Company',
      address_locality: 'Tokyo',
      address_admin_area_level_1: 'Tokyo',
      address_country: 'Japan',
      address_postal_code: '100-0001',
    };
    expect(() => CreateOrganizationSchema.parse(valid)).not.toThrow();
  });

  it('should accept all address fields at maximum length', () => {
    const valid = {
      name: 'Company',
      address: 'a'.repeat(255),
      address_route: 'b'.repeat(255),
      address_locality: 'c'.repeat(255),
      address_formatted_address: 'd'.repeat(500),
      address_postal_code: 'e'.repeat(50),
    };
    expect(() => CreateOrganizationSchema.parse(valid)).not.toThrow();
  });
});
