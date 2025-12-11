import type { PipedriveClient } from '../../pipedrive-client.js';
import { z } from 'zod';
import { IdSchema } from '../../schemas/common.js';

// Schema for bulk delete operations
const BulkDeleteDealsSchema = z
  .object({
    ids: z
      .array(IdSchema)
      .min(1, 'At least one deal ID is required')
      .describe('Array of deal IDs to delete'),
  })
  .strict();

export function getBulkTools(client: PipedriveClient) {
  return {
    'deals_bulk_delete': {
      description: `Delete multiple deals in bulk.

Marks multiple deals as deleted. After 30 days, the deals will be permanently deleted.

Workflow tips:
- Provide an array of deal IDs to delete
- Deals are soft-deleted first (marked as deleted)
- After 30 days, deals are permanently removed
- Use with caution - this affects multiple deals at once
- Consider using deals/list or deals/search to get IDs first

Common use cases:
- Clean up test deals: { "ids": [123, 456, 789] }
- Remove duplicate deals: { "ids": [111, 222] }
- Bulk cleanup after data import

Warning: This operation marks deals as deleted. They can be recovered within 30 days.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          ids: {
            type: 'array',
            items: { type: 'number' },
            description: 'Array of deal IDs to delete',
            minItems: 1,
          },
        },
        required: ['ids'],
      },
      handler: async (args: unknown) => {
        const { ids } = BulkDeleteDealsSchema.parse(args);
        // API expects comma-separated string
        const idsString = ids.join(',');
        return client.delete('/deals', { ids: idsString });
      },
    },
  };
}
