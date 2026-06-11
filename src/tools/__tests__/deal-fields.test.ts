import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { getCreateDealFieldTool } from '../fields/create-deal-field.js';
import { getUpdateDealFieldTool } from '../fields/update-deal-field.js';
import { getDeleteDealFieldTool } from '../fields/delete-deal-field.js';
import { getBulkDeleteDealFieldsTool } from '../fields/bulk-delete-deal-fields.js';

describe('deal-field CRUD tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('create posts to /dealFields', async () => {
    mockClient.post.mockResolvedValue({ success: true, data: { id: 1 } });
    const tools = getCreateDealFieldTool(mockClient);
    await tools['fields_create_deal_field'].handler({ name: 'X', field_type: 'varchar' });
    expect(mockClient.post).toHaveBeenCalledWith(
      '/dealFields',
      expect.objectContaining({
        name: 'X',
        field_type: 'varchar',
      })
    );
  });

  it('update puts to /dealFields/:id with id stripped from body', async () => {
    mockClient.put.mockResolvedValue({ success: true, data: { id: 1 } });
    const tools = getUpdateDealFieldTool(mockClient);
    await tools['fields_update_deal_field'].handler({ id: 1, name: 'Renamed' });
    expect(mockClient.put).toHaveBeenCalledWith('/dealFields/1', { name: 'Renamed' });
  });

  it('delete sends DELETE /dealFields/:id', async () => {
    mockClient.delete.mockResolvedValue({ success: true, data: { id: 5 } });
    const tools = getDeleteDealFieldTool(mockClient);
    await tools['fields_delete_deal_field'].handler({ id: 5 });
    expect(mockClient.delete).toHaveBeenCalledWith('/dealFields/5');
  });

  it('bulk delete normalizes array to comma-separated string', async () => {
    mockClient.delete.mockResolvedValue({ success: true, data: { id: [1, 2] } });
    const tools = getBulkDeleteDealFieldsTool(mockClient);
    await tools['fields_bulk_delete_deal_fields'].handler({ ids: [1, 2] });
    expect(mockClient.delete).toHaveBeenCalledWith('/dealFields', { ids: '1,2' });
  });
});
