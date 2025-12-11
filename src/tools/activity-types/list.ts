import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListActivityTypesSchema } from '../../schemas/activity-type.js';

export function getListActivityTypesTool(client: PipedriveClient) {
  return {
    'activity_types_list': {
      description: `Get all activity types.

Retrieves all activity types including both default and custom types.
Activity types define the categories of activities that can be created (e.g., call, meeting, task, deadline).

Workflow tips:
- Returns both system-defined and custom activity types
- Use to populate activity type selectors in UI
- Check is_custom_flag to distinguish custom from default types
- Cached for 5 minutes for better performance

Common use cases:
- List all types: {}
- Get activity type options for creating activities
- Check available activity types in the system`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
      },
      handler: async (args: unknown) => {
        ListActivityTypesSchema.parse(args);
        return client.get('/activityTypes', undefined, { enabled: true, ttl: 300000 });
      },
    },
  };
}
