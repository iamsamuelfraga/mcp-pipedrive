import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFieldDefinitionsEndpoint, isHashKey, loadFieldDefinitions } from '../custom-fields.js';
import { createMockClient } from '../../__tests__/mocks/client.mock.js';

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
