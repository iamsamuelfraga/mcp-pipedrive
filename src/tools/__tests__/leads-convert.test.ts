import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from '../../__tests__/mocks/client.mock.js';
import { getLeadConvertTools } from '../leads/convert.js';

describe('Lead conversion tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('leads_convert_to_deal posts to /api/v2/leads/{id}/convert/deal', async () => {
    mockClient.post.mockResolvedValue({
      success: true,
      data: { id: 'conv-123', status: 'queued' },
    });
    const tools = getLeadConvertTools(mockClient);
    const result = await tools['leads_convert_to_deal'].handler({ id: 'lead-uuid' });
    expect(mockClient.post).toHaveBeenCalledWith('/api/v2/leads/lead-uuid/convert/deal');
    expect((result as { data: { id: string } }).data.id).toBe('conv-123');
  });

  it('leads_convert_status fetches /api/v2/leads/{id}/convert/status/{conversion_id}', async () => {
    mockClient.get.mockResolvedValue({
      success: true,
      data: { id: 'conv-123', status: 'completed', deal_id: 42 },
    });
    const tools = getLeadConvertTools(mockClient);
    await tools['leads_convert_status'].handler({
      id: 'lead-uuid',
      conversion_id: 'conv-123',
    });
    expect(mockClient.get).toHaveBeenCalledWith('/api/v2/leads/lead-uuid/convert/status/conv-123');
  });
});
