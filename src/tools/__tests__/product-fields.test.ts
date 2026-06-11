import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { getCreateProductFieldTool } from '../fields/create-product-field.js';
import { getUpdateProductFieldTool } from '../fields/update-product-field.js';
import { getDeleteProductFieldTool } from '../fields/delete-product-field.js';
import { getBulkDeleteProductFieldsTool } from '../fields/bulk-delete-product-fields.js';

describe('product-field CRUD tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('create posts to /productFields', async () => {
    mockClient.post.mockResolvedValue({ success: true, data: { id: 1 } });
    const tools = getCreateProductFieldTool(mockClient);
    await tools['fields_create_product_field'].handler({ name: 'X', field_type: 'varchar' });
    expect(mockClient.post).toHaveBeenCalledWith(
      '/productFields',
      expect.objectContaining({
        name: 'X',
        field_type: 'varchar',
      })
    );
  });

  it('update puts to /productFields/:id with id stripped from body', async () => {
    mockClient.put.mockResolvedValue({ success: true, data: { id: 1 } });
    const tools = getUpdateProductFieldTool(mockClient);
    await tools['fields_update_product_field'].handler({ id: 1, name: 'Renamed' });
    expect(mockClient.put).toHaveBeenCalledWith('/productFields/1', { name: 'Renamed' });
  });

  it('delete sends DELETE /productFields/:id', async () => {
    mockClient.delete.mockResolvedValue({ success: true, data: { id: 5 } });
    const tools = getDeleteProductFieldTool(mockClient);
    await tools['fields_delete_product_field'].handler({ id: 5 });
    expect(mockClient.delete).toHaveBeenCalledWith('/productFields/5');
  });

  it('bulk delete normalizes array to comma-separated string', async () => {
    mockClient.delete.mockResolvedValue({ success: true, data: { id: [1, 2] } });
    const tools = getBulkDeleteProductFieldsTool(mockClient);
    await tools['fields_bulk_delete_product_fields'].handler({ ids: [1, 2] });
    expect(mockClient.delete).toHaveBeenCalledWith('/productFields', { ids: '1,2' });
  });
});
