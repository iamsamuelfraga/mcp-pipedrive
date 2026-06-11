import { describe, it, expect } from 'vitest';
import { getFieldDefinitionsEndpoint, isHashKey } from '../custom-fields.js';

describe('getFieldDefinitionsEndpoint', () => {
  it.each([
    ['deal', '/dealFields'],
    ['person', '/personFields'],
    ['organization', '/organizationFields'],
    ['product', '/productFields'],
    ['lead', '/dealFields'], // leads share deal fields
  ] as const)('maps %s to %s', (entity, endpoint) => {
    expect(getFieldDefinitionsEndpoint(entity)).toBe(endpoint);
  });
});

describe('isHashKey', () => {
  it('returns true for 40-char lowercase hex', () => {
    expect(isHashKey('abcdef0123456789abcdef0123456789abcdef01')).toBe(true);
  });

  it('returns false for short or non-hex strings', () => {
    expect(isHashKey('Industria')).toBe(false);
    expect(isHashKey('abc')).toBe(false);
    expect(isHashKey('ABCDEF0123456789ABCDEF0123456789ABCDEF01')).toBe(false); // uppercase
    expect(isHashKey('xyzdef0123456789abcdef0123456789abcdef01')).toBe(false); // non-hex
  });
});
