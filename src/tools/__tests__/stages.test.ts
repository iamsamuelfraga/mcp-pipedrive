import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from '../../__tests__/mocks/client.mock.js';
import { getStageTools } from '../stages/index.js';

describe('Stages tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('stages_list calls GET /api/v2/stages with no filter when omitted', async () => {
    mockClient.get.mockResolvedValue({ success: true, data: [{ id: 1 }] });
    const tools = getStageTools(mockClient);
    await tools['stages_list'].handler({});
    expect(mockClient.get).toHaveBeenCalledWith('/api/v2/stages', {}, expect.any(Object));
  });

  it('stages_list forwards pipeline_id filter as query param', async () => {
    mockClient.get.mockResolvedValue({ success: true, data: [] });
    const tools = getStageTools(mockClient);
    await tools['stages_list'].handler({ pipeline_id: 7 });
    expect(mockClient.get).toHaveBeenCalledWith(
      '/api/v2/stages',
      { pipeline_id: 7 },
      expect.any(Object)
    );
  });

  it('stages_get calls GET /api/v2/stages/{id}', async () => {
    mockClient.get.mockResolvedValue({ success: true, data: { id: 5 } });
    const tools = getStageTools(mockClient);
    await tools['stages_get'].handler({ id: 5 });
    expect(mockClient.get).toHaveBeenCalledWith('/api/v2/stages/5', undefined, expect.any(Object));
  });

  it('stages_create posts to /api/v2/stages with the parsed body', async () => {
    mockClient.post.mockResolvedValue({ success: true, data: { id: 11 } });
    const tools = getStageTools(mockClient);
    await tools['stages_create'].handler({
      name: 'Qualified',
      pipeline_id: 1,
      deal_probability: 50,
    });
    expect(mockClient.post).toHaveBeenCalledWith(
      '/api/v2/stages',
      expect.objectContaining({ name: 'Qualified', pipeline_id: 1, deal_probability: 50 })
    );
  });

  it('stages_update patches to /api/v2/stages/{id} with id stripped from body', async () => {
    mockClient.patch.mockResolvedValue({ success: true, data: { id: 5 } });
    const tools = getStageTools(mockClient);
    await tools['stages_update'].handler({ id: 5, name: 'Renamed', order_nr: 2 });
    expect(mockClient.patch).toHaveBeenCalledWith(
      '/api/v2/stages/5',
      expect.objectContaining({ name: 'Renamed', order_nr: 2 })
    );
    const body = (mockClient.patch.mock.calls[0] as any[])[1];
    expect(body.id).toBeUndefined();
  });

  it('stages_delete calls DELETE /api/v2/stages/{id}', async () => {
    mockClient.delete.mockResolvedValue({ success: true, data: { id: 5 } });
    const tools = getStageTools(mockClient);
    await tools['stages_delete'].handler({ id: 5 });
    expect(mockClient.delete).toHaveBeenCalledWith('/api/v2/stages/5');
  });
});
