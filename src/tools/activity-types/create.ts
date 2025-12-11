import type { PipedriveClient } from '../../pipedrive-client.js';
import { CreateActivityTypeSchema } from '../../schemas/activity-type.js';

export function getCreateActivityTypeTool(client: PipedriveClient) {
  return {
    'activity_types_create': {
      description: `Add a new custom activity type.

Creates a custom activity type with specified name, icon, and color.
Custom activity types allow you to categorize activities beyond the default types.

Workflow tips:
- Name is required (e.g., "Video Call", "Site Visit")
- Choose an icon_key (e.g., task, call, meeting, deadline, email, lunch, camera)
- Set a color as 6-character hex code without # (e.g., "FF5733")
- Custom types appear alongside default types in activity creation

Common use cases:
- Create "Video Call" type: { "name": "Video Call", "icon_key": "camera", "color": "4A90E2" }
- Create "Site Visit" type: { "name": "Site Visit", "icon_key": "meeting", "color": "E24A4A" }
- Create "Demo" type: { "name": "Demo", "icon_key": "task", "color": "4AE290" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: {
            type: 'string',
            description: 'Activity type name (e.g., "Video Call", "Site Visit")',
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
        },
        required: ['name', 'icon_key'],
      },
      handler: async (args: unknown) => {
        const data = CreateActivityTypeSchema.parse(args);
        return client.post('/activityTypes', data);
      },
    },
  };
}
