import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeleteFilterSchema } from '../../schemas/filter.js';

export function getDeleteFilterTool(client: PipedriveClient) {
  return {
    'filters/delete': {
      description: `Delete a filter in Pipedrive.

Marks a filter as deleted. The filter will no longer be available for use.

Workflow tips:
- Use filters/list to find filter IDs to delete
- Use filters/get to verify filter details before deletion
- For deleting multiple filters at once, use filters/bulk_delete instead
- Deletion is permanent and cannot be undone

Common use cases:
- Delete a specific filter: { "id": 123 }
- Remove unused filter: { "id": 456 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'number',
            description: 'ID of the filter to delete (required)',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = DeleteFilterSchema.parse(args);

        return client.delete(`/filters/${validated.id}`);
      },
    },
  };
}
