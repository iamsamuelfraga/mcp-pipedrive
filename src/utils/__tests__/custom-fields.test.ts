import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFieldDefinitionsEndpoint, isHashKey, loadFieldDefinitions, findFieldDefinition } from '../custom-fields.js';
import { createMockClient } from '../../__tests__/mocks/client.mock.js';
import { CustomFieldResolutionError } from '../custom-fields-errors.js';
import type { FieldDefinition } from '../custom-fields.js';

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

describe('loadFieldDefinitions', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('returns definitions array from Pipedrive', async () => {
    mockClient.get = vi.fn().mockResolvedValue({
      success: true,
      data: [
        { id: 1, key: 'a'.repeat(40), name: 'Industria', field_type: 'enum', options: [] },
      ],
    });

    const result = await loadFieldDefinitions(mockClient, 'deal', { fetchIfMissing: true });

    expect(mockClient.get).toHaveBeenCalledWith('/dealFields', undefined, {
      enabled: true,
      ttl: 900000,
    });
    expect(result).toHaveLength(1);
    expect(result?.[0].name).toBe('Industria');
  });

  it('returns undefined when cache is cold and fetchIfMissing is false', async () => {
    // The mock get always returns data; when fetchIfMissing=false we should NOT call it.
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: [] });

    const result = await loadFieldDefinitions(mockClient, 'deal', { fetchIfMissing: false });

    expect(mockClient.get).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('uses /dealFields for the lead entity', async () => {
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: [] });

    await loadFieldDefinitions(mockClient, 'lead', { fetchIfMissing: true });

    expect(mockClient.get).toHaveBeenCalledWith('/dealFields', undefined, expect.any(Object));
  });
});

describe('findFieldDefinition', () => {
  const defs: FieldDefinition[] = [
    { id: 1, key: 'a'.repeat(40), name: 'Industria', field_type: 'enum', options: [] },
    { id: 2, key: 'b'.repeat(40), name: 'Industry', field_type: 'varchar' },
    { id: 3, key: 'c'.repeat(40), name: 'Plan', field_type: 'enum', options: [] },
    { id: 4, key: 'd'.repeat(40), name: 'plan', field_type: 'varchar' }, // duplicate (case-insensitive)
  ];

  it('finds by exact name', () => {
    expect(findFieldDefinition(defs, 'Industria').key).toBe('a'.repeat(40));
  });

  it('finds by case-insensitive name', () => {
    expect(findFieldDefinition(defs, 'industria').key).toBe('a'.repeat(40));
  });

  it('finds by trimmed name', () => {
    expect(findFieldDefinition(defs, '  Industria  ').key).toBe('a'.repeat(40));
  });

  it('passes hash through (returns synthetic definition)', () => {
    const hash = 'e'.repeat(40);
    const result = findFieldDefinition(defs, hash);
    expect(result.key).toBe(hash);
    expect(result.field_type).toBe('unknown');
  });

  it('finds exact hash in definitions', () => {
    const result = findFieldDefinition(defs, 'a'.repeat(40));
    expect(result.id).toBe(1);
    expect(result.field_type).toBe('enum');
  });

  it('throws not_found with top-3 suggestions', () => {
    expect(() => findFieldDefinition(defs, 'Industri')).toThrow(CustomFieldResolutionError);
    try {
      findFieldDefinition(defs, 'Industri');
    } catch (e) {
      const err = e as CustomFieldResolutionError;
      expect(err.kind).toBe('not_found');
      expect(err.suggestions).toContain('Industria');
    }
  });

  it('throws duplicate_name when two definitions share a case-insensitive name', () => {
    try {
      findFieldDefinition(defs, 'Plan');
      throw new Error('expected duplicate_name to throw');
    } catch (e) {
      const err = e as CustomFieldResolutionError;
      expect(err.kind).toBe('duplicate_name');
      expect(err.candidates).toEqual(['c'.repeat(40), 'd'.repeat(40)]);
    }
  });
});
