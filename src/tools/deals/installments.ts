import type { PipedriveClient } from '../../pipedrive-client.js';
import {
  ListInstallmentsSchema,
  AddInstallmentSchema,
  UpdateInstallmentSchema,
  DeleteInstallmentSchema,
} from '../../schemas/installment.js';

/**
 * Deal installment tools (API v2). Installments are fixed, scheduled payments
 * attached to a deal — the modern replacement for the legacy Subscriptions API.
 */
export function getInstallmentTools(client: PipedriveClient) {
  return {
    deals_list_installments: {
      description: `List installments attached to one or more deals (API v2).

Installments are scheduled, fixed payments on a deal (the modern replacement for the
legacy subscriptions feature). Pass the deal IDs you want installments for.

Common use cases:
- Installments of one deal: { "deal_ids": [123] }
- Installments across several deals: { "deal_ids": [123, 456, 789] }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          deal_ids: {
            type: 'array',
            items: { type: 'number' },
            description: 'Deal IDs to fetch installments for (1-100)',
          },
          cursor: { type: 'string', description: 'Pagination cursor from a previous call' },
          limit: { type: 'number', description: 'Items per page (max 500)' },
        },
        required: ['deal_ids'],
      },
      handler: async (args: unknown) => {
        const { deal_ids, cursor, limit } = ListInstallmentsSchema.parse(args);
        const params: Record<string, string | number> = { deal_ids: deal_ids.join(',') };
        if (cursor !== undefined) params.cursor = cursor;
        if (limit !== undefined) params.limit = limit;
        return client.get('/api/v2/deals/installments', params, { enabled: true, ttl: 60000 });
      },
    },

    deals_add_installment: {
      description: `Add an installment to a deal (API v2).

Required: description (name), amount (positive, non-zero) and billing_date (YYYY-MM-DD).

Common use cases:
- { "id": 123, "description": "Deposit", "amount": 500, "billing_date": "2026-01-15" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'Deal ID to attach the installment to' },
          description: { type: 'string', description: 'Installment name' },
          amount: { type: 'number', description: 'Installment amount (positive, non-zero)' },
          billing_date: { type: 'string', description: 'Billing date (YYYY-MM-DD)' },
        },
        required: ['id', 'description', 'amount', 'billing_date'],
      },
      handler: async (args: unknown) => {
        const { id, ...body } = AddInstallmentSchema.parse(args);
        return client.post(`/api/v2/deals/${id}/installments`, body);
      },
    },

    deals_update_installment: {
      description: `Update an existing installment on a deal (API v2).

Provide the deal id, the installment_id, and any of description / amount / billing_date.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'Deal ID the installment belongs to' },
          installment_id: { type: 'number', description: 'Installment ID to update' },
          description: { type: 'string', description: 'New installment name' },
          amount: { type: 'number', description: 'New amount (positive, non-zero)' },
          billing_date: { type: 'string', description: 'New billing date (YYYY-MM-DD)' },
        },
        required: ['id', 'installment_id'],
      },
      handler: async (args: unknown) => {
        const { id, installment_id, ...body } = UpdateInstallmentSchema.parse(args);
        return client.patch(`/api/v2/deals/${id}/installments/${installment_id}`, body);
      },
    },

    deals_delete_installment: {
      description: `Delete an installment from a deal (API v2).`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'Deal ID the installment belongs to' },
          installment_id: { type: 'number', description: 'Installment ID to delete' },
        },
        required: ['id', 'installment_id'],
      },
      handler: async (args: unknown) => {
        const { id, installment_id } = DeleteInstallmentSchema.parse(args);
        return client.delete(`/api/v2/deals/${id}/installments/${installment_id}`);
      },
    },
  };
}
