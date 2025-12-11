import type { PipedriveClient } from '../../pipedrive-client.js';
import { BulkDeleteFiltersSchema } from '../../schemas/filter.js';

export function getBulkDeleteFiltersTool(client: PipedriveClient) {
  return {
    'filters/bulk_delete': {
      description: `Delete multiple filters at once in Pipedrive.

Marks multiple filters as deleted in a single operation. More efficient than deleting one at a time.

Workflow tips:
- Provide comma-separated filter IDs as a string (e.g., "1,2,3,4")
- Use filters/list to find filter IDs to delete
- All specified filters will be deleted in one API call
- Deletion is permanent and cannot be undone

Common use cases:
- Delete multiple filters: { "ids": "123,456,789" }
- Clean up old filters: { "ids": "1,2,3,4,5" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          ids: {
            type: 'string',
            description: 'Comma-separated filter IDs to delete (required). Example: "1,2,3"',
          },
        },
        required: ['ids'],
      },
      handler: async (args: unknown) => {
        const validated = BulkDeleteFiltersSchema.parse(args);

        return client.delete('/filters', { ids: validated.ids });
      },
    },
  };
}
