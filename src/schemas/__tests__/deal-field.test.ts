import { describe, it, expect } from 'vitest';
import {
  CreateDealFieldSchema,
  UpdateDealFieldSchema,
  DeleteDealFieldSchema,
  BulkDeleteDealFieldsSchema,
} from '../deal-field.js';

describe('CreateDealFieldSchema', () => {
  it('accepts a basic varchar field', () => {
    const r = CreateDealFieldSchema.parse({ name: 'X', field_type: 'varchar' });
    expect(r.name).toBe('X');
  });

  it('requires options for enum fields', () => {
    expect(() => CreateDealFieldSchema.parse({ name: 'X', field_type: 'enum' })).toThrow();
  });

  it('accepts enum with options', () => {
    const r = CreateDealFieldSchema.parse({
      name: 'X',
      field_type: 'enum',
      options: [{ label: 'A' }],
    });
    expect(r.options?.[0].label).toBe('A');
  });
});

describe('UpdateDealFieldSchema', () => {
  it('requires id', () => {
    expect(() => UpdateDealFieldSchema.parse({ name: 'X' })).toThrow();
  });

  it('accepts id with optional name', () => {
    const r = UpdateDealFieldSchema.parse({ id: 1, name: 'Renamed' });
    expect(r.id).toBe(1);
  });
});

describe('DeleteDealFieldSchema', () => {
  it('requires id', () => {
    expect(() => DeleteDealFieldSchema.parse({})).toThrow();
    expect(DeleteDealFieldSchema.parse({ id: 5 }).id).toBe(5);
  });
});

describe('BulkDeleteDealFieldsSchema', () => {
  it('accepts comma-separated string', () => {
    expect(BulkDeleteDealFieldsSchema.parse({ ids: '1,2,3' }).ids).toBe('1,2,3');
  });

  it('accepts numeric array', () => {
    expect(BulkDeleteDealFieldsSchema.parse({ ids: [1, 2, 3] }).ids).toEqual([1, 2, 3]);
  });
});
