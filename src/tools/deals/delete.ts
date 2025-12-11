import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeleteDealSchema } from '../../schemas/deal.js';

export function getDeleteDealTool(client: PipedriveClient) {
  return {
    'deals/delete': {
      description: `Delete a deal permanently.

WARNING: This permanently deletes the deal. Consider marking as lost instead.

Workflow tips:
- Deletion is permanent and cannot be undone
- Consider using deals/update with status='lost' instead
- Use deals/get first to confirm you have the right deal
- Related activities and notes are preserved but detached

Common use cases:
- Delete test deal: { "id": 123 }
- Clean up duplicate: { "id": 456 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal to delete' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = DeleteDealSchema.parse(args);
        return client.delete(`/deals/${id}`);
      },
    },
  };
}
