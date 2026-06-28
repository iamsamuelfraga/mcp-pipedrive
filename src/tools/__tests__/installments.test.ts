import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockClient } from '../../__tests__/mocks/client.mock.js';
import { getInstallmentTools } from '../deals/installments.js';

describe('deal installment tools (API v2)', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('list joins deal_ids and hits /api/v2/deals/installments', async () => {
    mockClient.get.mockResolvedValue({ success: true, data: [] });
    const tools = getInstallmentTools(mockClient);
    await tools['deals_list_installments'].handler({ deal_ids: [1, 2, 3] });
    expect(mockClient.get).toHaveBeenCalledWith(
      '/api/v2/deals/installments',
      { deal_ids: '1,2,3' },
      expect.objectContaining({ enabled: true })
    );
  });

  it('list rejects an empty deal_ids array', async () => {
    const tools = getInstallmentTools(mockClient);
    await expect(tools['deals_list_installments'].handler({ deal_ids: [] })).rejects.toThrow();
  });

  it('add posts the body to /api/v2/deals/{id}/installments with id stripped', async () => {
    mockClient.post.mockResolvedValue({ success: true, data: { id: 10 } });
    const tools = getInstallmentTools(mockClient);
    await tools['deals_add_installment'].handler({
      id: 7,
      description: 'Deposit',
      amount: 500,
      billing_date: '2026-01-15',
    });
    expect(mockClient.post).toHaveBeenCalledWith('/api/v2/deals/7/installments', {
      description: 'Deposit',
      amount: 500,
      billing_date: '2026-01-15',
    });
  });

  it('add rejects a non-positive amount', async () => {
    const tools = getInstallmentTools(mockClient);
    await expect(
      tools['deals_add_installment'].handler({
        id: 7,
        description: 'Bad',
        amount: 0,
        billing_date: '2026-01-15',
      })
    ).rejects.toThrow();
  });

  it('update patches /api/v2/deals/{id}/installments/{installment_id} with ids stripped', async () => {
    mockClient.patch.mockResolvedValue({ success: true, data: { id: 10 } });
    const tools = getInstallmentTools(mockClient);
    await tools['deals_update_installment'].handler({
      id: 7,
      installment_id: 10,
      amount: 750,
    });
    expect(mockClient.patch).toHaveBeenCalledWith('/api/v2/deals/7/installments/10', {
      amount: 750,
    });
  });

  it('delete sends DELETE /api/v2/deals/{id}/installments/{installment_id}', async () => {
    mockClient.delete.mockResolvedValue({ success: true, data: { id: 10 } });
    const tools = getInstallmentTools(mockClient);
    await tools['deals_delete_installment'].handler({ id: 7, installment_id: 10 });
    expect(mockClient.delete).toHaveBeenCalledWith('/api/v2/deals/7/installments/10');
  });
});
