import { BulkDeleteActivitiesSchema } from '../../schemas/activity.js';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';

export function createBulkDeleteActivitiesTool(client: PipedriveClient) {
  return {
    name: 'activities/bulk_delete',
    description: `Delete multiple activities in a single request.

This endpoint allows you to delete up to 100 activities at once by providing
an array of activity IDs.

Workflow tips:
- Maximum 100 activities per request
- All activities must exist and be accessible to the user
- Deletion is permanent and cannot be undone
- Failed deletions for individual activities won't stop others from being deleted

Common use cases:
- Clean up completed activities in bulk
- Remove outdated or duplicate activities
- Archive old activities by deleting them

Example:
{ "ids": [123, 456, 789] }`,
    inputSchema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'number' },
          minItems: 1,
          maxItems: 100,
          description: 'Array of activity IDs to delete (max 100)',
        },
      },
      required: ['ids'],
    },
    handler: async (args: unknown) => {
      const parsed = BulkDeleteActivitiesSchema.parse(args);

      // Convert array to comma-separated string for query param
      const idsParam = parsed.ids.join(',');

      const response = await client.delete<PipedriveResponse<{ id: number }[]>>('/activities', {
        ids: idsParam,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    },
  };
}
