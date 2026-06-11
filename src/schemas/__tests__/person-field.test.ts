import { describe, it, expect } from 'vitest';
import {
  CreatePersonFieldSchema,
  UpdatePersonFieldSchema,
  DeletePersonFieldSchema,
  BulkDeletePersonFieldsSchema,
} from '../person-field.js';

describe('CreatePersonFieldSchema', () => {
  it('accepts a basic varchar field', () => {
    const r = CreatePersonFieldSchema.parse({ name: 'X', field_type: 'varchar' });
    expect(r.name).toBe('X');
  });

  it('requires options for enum fields', () => {
    expect(() => CreatePersonFieldSchema.parse({ name: 'X', field_type: 'enum' })).toThrow();
  });

  it('accepts enum with options', () => {
    const r = CreatePersonFieldSchema.parse({
      name: 'X',
      field_type: 'enum',
      options: [{ label: 'A' }],
    });
    expect(r.options?.[0].label).toBe('A');
  });
});

describe('UpdatePersonFieldSchema', () => {
  it('requires id', () => {
    expect(() => UpdatePersonFieldSchema.parse({ name: 'X' })).toThrow();
  });

  it('accepts id with optional name', () => {
    const r = UpdatePersonFieldSchema.parse({ id: 1, name: 'Renamed' });
    expect(r.id).toBe(1);
  });
});

describe('DeletePersonFieldSchema', () => {
  it('requires id', () => {
    expect(() => DeletePersonFieldSchema.parse({})).toThrow();
    expect(DeletePersonFieldSchema.parse({ id: 5 }).id).toBe(5);
  });
});

describe('BulkDeletePersonFieldsSchema', () => {
  it('accepts comma-separated string', () => {
    expect(BulkDeletePersonFieldsSchema.parse({ ids: '1,2,3' }).ids).toBe('1,2,3');
  });

  it('accepts numeric array', () => {
    expect(BulkDeletePersonFieldsSchema.parse({ ids: [1, 2, 3] }).ids).toEqual([1, 2, 3]);
  });
});
