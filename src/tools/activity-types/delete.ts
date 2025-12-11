import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeleteActivityTypeSchema } from '../../schemas/activity-type.js';

export function getDeleteActivityTypeTool(client: PipedriveClient) {
  return {
    'activity_types/delete': {
      description: `Delete an activity type.

Marks an activity type as deleted. Only custom activity types can be deleted, not system-defined ones.

Workflow tips:
- Use activity_types/list to find the activity type ID first
- Only custom activity types can be deleted (is_custom_flag = true)
- Existing activities with this type will retain the type but it won't be available for new activities
- This action marks the type as inactive (active_flag = false)

Common use cases:
- Remove unused custom type: { "id": 12 }
- Clean up old activity types: { "id": 15 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'number',
            description: 'ID of the activity type to delete'
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = DeleteActivityTypeSchema.parse(args);
        return client.delete(`/activityTypes/${id}`);
      },
    },
  };
}
