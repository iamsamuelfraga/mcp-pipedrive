import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from '../../__tests__/mocks/client.mock.js';
import { getLeadLabelTools } from '../leads/labels.js';

describe('Lead label tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('lead_labels_create posts to /leadLabels', async () => {
    mockClient.post.mockResolvedValue({ success: true, data: { id: 'uuid-1', name: 'Hot', color: 'red' } });
    const tools = getLeadLabelTools(mockClient);
    await tools['lead_labels_create'].handler({ name: 'Hot', color: 'red' });
    expect(mockClient.post).toHaveBeenCalledWith('/leadLabels', { name: 'Hot', color: 'red' });
  });

  it('lead_labels_update patches /leadLabels/{id} with id stripped from body', async () => {
    mockClient.patch.mockResolvedValue({ success: true, data: { id: 'uuid-1' } });
    const tools = getLeadLabelTools(mockClient);
    await tools['lead_labels_update'].handler({ id: 'uuid-1', name: 'Cool' });
    expect(mockClient.patch).toHaveBeenCalledWith('/leadLabels/uuid-1', { name: 'Cool' });
    const body = (mockClient.patch.mock.calls[0] as any[])[1];
    expect(body.id).toBeUndefined();
  });

  it('lead_labels_delete calls DELETE /leadLabels/{id}', async () => {
    mockClient.delete.mockResolvedValue({ success: true, data: { id: 'uuid-1' } });
    const tools = getLeadLabelTools(mockClient);
    await tools['lead_labels_delete'].handler({ id: 'uuid-1' });
    expect(mockClient.delete).toHaveBeenCalledWith('/leadLabels/uuid-1');
  });
});
