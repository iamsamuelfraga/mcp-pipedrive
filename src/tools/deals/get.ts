import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetDealSchema } from '../../schemas/deal.js';

export function getGetDealTool(client: PipedriveClient) {
  return {
    'deals/get': {
      description: `Get detailed information about a specific deal by ID.

Retrieves complete information about a single deal, including all custom fields.

Workflow tips:
- Use deals/search or deals/list to find deal IDs first
- Response includes person, organization, pipeline, and stage information
- Cached for 5 minutes for better performance

Common use cases:
- Get deal details: { "id": 123 }
- Check deal status before updating
- Retrieve deal information for analysis`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal to retrieve' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = GetDealSchema.parse(args);
        return client.get(`/deals/${id}`, undefined, { enabled: true, ttl: 300000 });
      },
    },
  };
}
