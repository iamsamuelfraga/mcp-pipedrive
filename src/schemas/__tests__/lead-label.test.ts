import { describe, it, expect } from 'vitest';
import {
  CreateLeadLabelSchema,
  UpdateLeadLabelSchema,
  DeleteLeadLabelSchema,
} from '../lead-label.js';

describe('CreateLeadLabelSchema', () => {
  it('accepts a label with valid color', () => {
    const r = CreateLeadLabelSchema.parse({ name: 'Hot', color: 'red' });
    expect(r.name).toBe('Hot');
    expect(r.color).toBe('red');
  });

  it('requires name and color', () => {
    expect(() => CreateLeadLabelSchema.parse({})).toThrow();
    expect(() => CreateLeadLabelSchema.parse({ name: 'Hot' })).toThrow();
    expect(() => CreateLeadLabelSchema.parse({ color: 'red' })).toThrow();
  });

  it('rejects unknown colors', () => {
    expect(() => CreateLeadLabelSchema.parse({ name: 'X', color: 'magenta' })).toThrow();
  });
});

describe('UpdateLeadLabelSchema', () => {
  it('requires id, allows partial update', () => {
    const r = UpdateLeadLabelSchema.parse({ id: 'abc-uuid', name: 'Renamed' });
    expect(r.id).toBe('abc-uuid');
    expect(r.name).toBe('Renamed');
  });
});

describe('DeleteLeadLabelSchema', () => {
  it('requires id', () => {
    expect(() => DeleteLeadLabelSchema.parse({})).toThrow();
    expect(DeleteLeadLabelSchema.parse({ id: 'abc-uuid' }).id).toBe('abc-uuid');
  });
});
