import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from '../../__tests__/mocks/client.mock.js';
import { getDealConvertTools } from '../deals/convert.js';

describe('Deal conversion tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('deals_convert_to_lead posts to /api/v2/deals/{id}/convert/lead', async () => {
    mockClient.post.mockResolvedValue({
      success: true,
      data: { id: 'conv-456', status: 'queued' },
    });
    const tools = getDealConvertTools(mockClient);
    const result = await tools['deals_convert_to_lead'].handler({ id: 99 });
    expect(mockClient.post).toHaveBeenCalledWith('/api/v2/deals/99/convert/lead');
    expect((result as { data: { id: string } }).data.id).toBe('conv-456');
  });

  it('deals_convert_status fetches /api/v2/deals/{id}/convert/status/{conversion_id}', async () => {
    mockClient.get.mockResolvedValue({
      success: true,
      data: { id: 'conv-456', status: 'completed', lead_id: 'lead-new-uuid' },
    });
    const tools = getDealConvertTools(mockClient);
    await tools['deals_convert_status'].handler({ id: 99, conversion_id: 'conv-456' });
    expect(mockClient.get).toHaveBeenCalledWith(
      '/api/v2/deals/99/convert/status/conv-456'
    );
  });
});
