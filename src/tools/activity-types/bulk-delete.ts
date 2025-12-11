import type { PipedriveClient } from '../../pipedrive-client.js';
import { BulkDeleteActivityTypesSchema } from '../../schemas/activity-type.js';

export function getBulkDeleteActivityTypesTool(client: PipedriveClient) {
  return {
    'activity_types/bulk_delete': {
      description: `Delete multiple activity types in bulk.

Marks multiple activity types as deleted in a single operation. Only custom activity types can be deleted.

Workflow tips:
- Provide comma-separated activity type IDs
- Only custom activity types can be deleted (is_custom_flag = true)
- More efficient than deleting one at a time
- All specified types are marked as inactive in one request

Common use cases:
- Remove multiple custom types: { "ids": "12,13,14" }
- Bulk cleanup: { "ids": "15,16,17,18" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          ids: {
            type: 'string',
            description: 'Comma-separated activity type IDs to delete (e.g., "1,2,3")'
          },
        },
        required: ['ids'],
      },
      handler: async (args: unknown) => {
        const { ids } = BulkDeleteActivityTypesSchema.parse(args);
        return client.delete('/activityTypes', { ids });
      },
    },
  };
}
