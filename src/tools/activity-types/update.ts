import type { PipedriveClient } from '../../pipedrive-client.js';
import { UpdateActivityTypeSchema } from '../../schemas/activity-type.js';

export function getUpdateActivityTypeTool(client: PipedriveClient) {
  return {
    'activity_types_update': {
      description: `Update an existing activity type.

Updates activity type properties such as name, icon, color, or display order.

Workflow tips:
- Use activity_types/list to find the activity type ID first
- Only include fields you want to update
- Cannot update system-defined activity types, only custom ones
- Changes affect all activities using this type

Common use cases:
- Change name: { "id": 12, "name": "Video Conference" }
- Update color: { "id": 12, "color": "00FF00" }
- Change icon: { "id": 12, "icon_key": "camera" }
- Update order: { "id": 12, "order_nr": 5 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'number',
            description: 'ID of the activity type to update',
          },
          name: {
            type: 'string',
            description: 'Activity type name',
          },
          icon_key: {
            type: 'string',
            description:
              'Icon identifier (e.g., task, call, meeting, deadline, email, lunch, camera)',
          },
          color: {
            type: 'string',
            description: 'Color as 6-character hex code without # (e.g., "FF5733")',
          },
          order_nr: {
            type: 'number',
            description: 'Order number for display sorting',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, ...data } = UpdateActivityTypeSchema.parse(args);
        return client.put(`/activityTypes/${id}`, data);
      },
    },
  };
}
