import { describe, it, expect } from 'vitest';
import {
  CreateProductFieldSchema,
  UpdateProductFieldSchema,
  DeleteProductFieldSchema,
  BulkDeleteProductFieldsSchema,
} from '../product-field.js';

describe('CreateProductFieldSchema', () => {
  it('accepts a basic varchar field', () => {
    const r = CreateProductFieldSchema.parse({ name: 'X', field_type: 'varchar' });
    expect(r.name).toBe('X');
  });

  it('requires options for enum fields', () => {
    expect(() => CreateProductFieldSchema.parse({ name: 'X', field_type: 'enum' })).toThrow();
  });

  it('accepts enum with options', () => {
    const r = CreateProductFieldSchema.parse({
      name: 'X',
      field_type: 'enum',
      options: [{ label: 'A' }],
    });
    expect(r.options?.[0].label).toBe('A');
  });
});

describe('UpdateProductFieldSchema', () => {
  it('requires id', () => {
    expect(() => UpdateProductFieldSchema.parse({ name: 'X' })).toThrow();
  });

  it('accepts id with optional name', () => {
    const r = UpdateProductFieldSchema.parse({ id: 1, name: 'Renamed' });
    expect(r.id).toBe(1);
  });
});

describe('DeleteProductFieldSchema', () => {
  it('requires id', () => {
    expect(() => DeleteProductFieldSchema.parse({})).toThrow();
    expect(DeleteProductFieldSchema.parse({ id: 5 }).id).toBe(5);
  });
});

describe('BulkDeleteProductFieldsSchema', () => {
  it('accepts comma-separated string', () => {
    expect(BulkDeleteProductFieldsSchema.parse({ ids: '1,2,3' }).ids).toBe('1,2,3');
  });

  it('accepts numeric array', () => {
    expect(BulkDeleteProductFieldsSchema.parse({ ids: [1, 2, 3] }).ids).toEqual([1, 2, 3]);
  });
});
