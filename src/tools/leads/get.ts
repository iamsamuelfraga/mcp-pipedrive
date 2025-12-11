import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetLeadSchema } from '../../schemas/lead.js';

export function getGetLeadTool(client: PipedriveClient) {
  return {
    'leads_get': {
      description: `Get details of a specific lead by UUID.

Returns detailed information about a single lead including all fields and custom field values.

Workflow tips:
- Lead IDs are UUIDs (not integers like other entities)
- Use leads/search to find leads by title or other fields
- Custom fields from deals are inherited by leads
- Only set custom field values will appear in response

Common use cases:
- Get lead details: { "id": "adf21080-0e10-11eb-879b-05d71fb426ec" }
- Retrieve lead for update: { "id": "<uuid>" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'string',
            description: 'UUID of the lead to retrieve',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = GetLeadSchema.parse(args);
        return client.get(
          `/leads/${validated.id}`,
          {},
          { enabled: true, ttl: 300000 } // Cache for 5 minutes
        );
      },
    },
  };
}
