import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetRecentsSchema } from '../../schemas/system.js';

export function getRecentsTool(client: PipedriveClient) {
  return {
    'system_get_recents': {
      description: `Get recently viewed or modified items.

Returns data about all recent changes that occurred after the given timestamp. This is useful for tracking activity, syncing data, or showing users what they've recently worked on.

Required fields:
- since_timestamp: Timestamp in UTC (YYYY-MM-DD HH:MM:SS format)

Optional fields:
- items: Filter by specific item types (comma-separated)
- start: Pagination start (default: 0)
- limit: Items shown per page

Supported item types:
- activity
- deal
- person
- organization
- product
- note
- file
- mail
- etc.

Workflow tips:
- Use ISO 8601 or YYYY-MM-DD HH:MM:SS format for timestamps
- Filter by item type to reduce response size
- Use pagination for large result sets
- Track changes since last sync

Common use cases:
- Recent activity: { "since_timestamp": "2024-12-10 10:00:00" }
- Recent deals only: { "since_timestamp": "2024-12-10 10:00:00", "items": "deal" }
- Multiple types: { "since_timestamp": "2024-12-10 10:00:00", "items": "deal,person,organization" }
- Paginated results: { "since_timestamp": "2024-12-10 10:00:00", "start": 0, "limit": 50 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          since_timestamp: {
            type: 'string',
            description: 'The timestamp in UTC. Format: YYYY-MM-DD HH:MM:SS or ISO 8601',
          },
          items: {
            type: 'string',
            description:
              'Multiple selection of item types to include (comma-separated, e.g., "deal,person,organization")',
          },
          start: {
            type: 'number',
            description: 'Pagination start (default: 0)',
          },
          limit: {
            type: 'number',
            description: 'Items shown per page',
          },
        },
        required: ['since_timestamp'],
      },
      handler: async (args: unknown) => {
        const data = GetRecentsSchema.parse(args);
        return client.get('/recents', data);
      },
    },
  };
}
