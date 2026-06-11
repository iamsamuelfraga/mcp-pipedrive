import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { getCreatePersonFieldTool } from '../fields/create-person-field.js';
import { getUpdatePersonFieldTool } from '../fields/update-person-field.js';
import { getDeletePersonFieldTool } from '../fields/delete-person-field.js';
import { getBulkDeletePersonFieldsTool } from '../fields/bulk-delete-person-fields.js';

describe('person-field CRUD tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('create posts to /personFields', async () => {
    mockClient.post.mockResolvedValue({ success: true, data: { id: 1 } });
    const tools = getCreatePersonFieldTool(mockClient);
    await tools['fields_create_person_field'].handler({ name: 'X', field_type: 'varchar' });
    expect(mockClient.post).toHaveBeenCalledWith(
      '/personFields',
      expect.objectContaining({
        name: 'X',
        field_type: 'varchar',
      })
    );
  });

  it('update puts to /personFields/:id with id stripped from body', async () => {
    mockClient.put.mockResolvedValue({ success: true, data: { id: 1 } });
    const tools = getUpdatePersonFieldTool(mockClient);
    await tools['fields_update_person_field'].handler({ id: 1, name: 'Renamed' });
    expect(mockClient.put).toHaveBeenCalledWith('/personFields/1', { name: 'Renamed' });
  });

  it('delete sends DELETE /personFields/:id', async () => {
    mockClient.delete.mockResolvedValue({ success: true, data: { id: 5 } });
    const tools = getDeletePersonFieldTool(mockClient);
    await tools['fields_delete_person_field'].handler({ id: 5 });
    expect(mockClient.delete).toHaveBeenCalledWith('/personFields/5');
  });

  it('bulk delete normalizes array to comma-separated string', async () => {
    mockClient.delete.mockResolvedValue({ success: true, data: { id: [1, 2] } });
    const tools = getBulkDeletePersonFieldsTool(mockClient);
    await tools['fields_bulk_delete_person_fields'].handler({ ids: [1, 2] });
    expect(mockClient.delete).toHaveBeenCalledWith('/personFields', { ids: '1,2' });
  });
});
