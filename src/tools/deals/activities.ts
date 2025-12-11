import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListDealActivitiesSchema } from '../../schemas/deal.js';

export function getActivityTools(client: PipedriveClient) {
  return {
    'deals/list_activities': {
      description: `List all activities associated with a deal.

Returns all activities linked to a specific deal, including calls, meetings, tasks, emails, and deadlines.

Workflow tips:
- Filter by done status to see completed or pending activities
- Use start and limit for pagination
- Exclude specific activity IDs if needed
- Cached for 5 minutes for better performance
- Activities are sorted by due date

Common use cases:
- List all activities: { "id": 123 }
- List pending activities: { "id": 123, "done": "0" }
- List completed activities: { "id": 123, "done": "1" }
- Paginated results: { "id": 123, "start": 0, "limit": 50 }
- Exclude certain activities: { "id": 123, "exclude": "1,2,3" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal' },
          start: { type: 'number', description: 'Pagination start', default: 0 },
          limit: { type: 'number', description: 'Number of items to return per page' },
          done: {
            type: 'string',
            enum: ['0', '1'],
            description: 'Filter by activity status (0 = not done, 1 = done)',
          },
          exclude: { type: 'string', description: 'Comma-separated activity IDs to exclude' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, ...params } = ListDealActivitiesSchema.parse(args);
        return client.get(`/deals/${id}/activities`, params, { enabled: true, ttl: 300000 });
      },
    },
  };
}
