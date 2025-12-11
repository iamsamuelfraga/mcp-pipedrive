import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetFilterSchema } from '../../schemas/filter.js';

export function getGetFilterTool(client: PipedriveClient) {
  return {
    'filters/get': {
      description: `Get a specific filter by ID.

Returns detailed data about a specific filter, including its condition lines.

Workflow tips:
- Returns complete filter configuration including conditions structure
- Use filters/list to discover available filter IDs
- The conditions field contains the filter's logic (glue, conditions array)
- Results are heavily cached for 15 minutes

Common use cases:
- Get filter details: { "id": 123 }
- Inspect filter conditions: { "id": 456 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'number',
            description: 'ID of the filter to retrieve (required)',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = GetFilterSchema.parse(args);

        return client.get(
          `/filters/${validated.id}`,
          {},
          { enabled: true, ttl: 900000 } // Cache for 15 minutes
        );
      },
    },
  };
}
