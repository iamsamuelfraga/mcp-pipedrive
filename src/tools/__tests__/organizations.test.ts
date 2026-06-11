import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { createCreateOrganizationTool } from '../organizations/create.js';
import { createUpdateOrganizationTool } from '../organizations/update.js';

describe('organizations/create with custom_fields', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('resolves custom_fields by name and merges hash-keyed values', async () => {
    const defs = [{ id: 1, key: 'a'.repeat(40), name: 'Tier', field_type: 'varchar' }];
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    mockClient.post.mockResolvedValue({ success: true, data: { id: 1, name: 'ACME' } });

    const tool = createCreateOrganizationTool(mockClient);
    await tool.handler({ name: 'ACME', custom_fields: { Tier: 'Gold' } });

    expect(mockClient.post).toHaveBeenCalledWith(
      '/organizations',
      expect.objectContaining({ name: 'ACME', [defs[0].key]: 'Gold' })
    );
    const body = (mockClient.post.mock.calls[0] as any[])[1];
    expect(body.custom_fields).toBeUndefined();
  });
});

describe('organizations/update with custom_fields', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('resolves and merges custom fields into PUT body', async () => {
    const defs = [{ id: 1, key: 'a'.repeat(40), name: 'Tier', field_type: 'varchar' }];
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    mockClient.put.mockResolvedValue({ success: true, data: { id: 5 } });

    const tool = createUpdateOrganizationTool(mockClient);
    await tool.handler({ id: 5, custom_fields: { Tier: 'Platinum' } });

    expect(mockClient.put).toHaveBeenCalledWith(
      '/organizations/5',
      expect.objectContaining({ [defs[0].key]: 'Platinum' })
    );
    const body = (mockClient.put.mock.calls[0] as any[])[1];
    expect(body.custom_fields).toBeUndefined();
  });
});
