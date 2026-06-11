import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetDealSchema } from '../../schemas/deal.js';
import { enrichEntityWithCustomFields } from '../../utils/custom-fields.js';

export function getGetDealTool(client: PipedriveClient) {
  return {
    deals_get: {
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
        const response = await client.get<{ success: boolean; data?: unknown }>(
          `/deals/${id}`,
          undefined,
          { enabled: true, ttl: 300000 }
        );
        return enrichEntityWithCustomFields(client, 'deal', response);
      },
    },
  };
}
