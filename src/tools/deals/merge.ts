import type { PipedriveClient } from '../../pipedrive-client.js';
import { MergeDealsSchema } from '../../schemas/deal.js';

export function getMergeTools(client: PipedriveClient) {
  return {
    'deals/merge': {
      description: `Merge two deals together.

Merges one deal into another, combining their data. The source deal will be deleted and its data will be merged into the target deal.

Workflow tips:
- The deal specified in 'id' will be DELETED (source)
- The deal specified in 'merge_with_id' will be KEPT (target)
- All activities, notes, and followers will be transferred to the target deal
- Use deals/get to review both deals before merging
- This operation cannot be undone
- Deal products, files, and participants are merged
- Useful for cleaning up duplicates

Common use cases:
- Merge duplicate deals: { "id": 123, "merge_with_id": 456 }
- Consolidate related deals: { "id": 789, "merge_with_id": 456 }
- Clean up data after finding duplicates

Warning: This operation is irreversible. The source deal (id) will be permanently deleted.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal to merge (will be deleted)' },
          merge_with_id: { type: 'number', description: 'ID of the deal to merge with (will be kept)' },
        },
        required: ['id', 'merge_with_id'],
      },
      handler: async (args: unknown) => {
        const { id, merge_with_id } = MergeDealsSchema.parse(args);
        return client.put(`/deals/${id}/merge`, { merge_with_id });
      },
    },
  };
}
