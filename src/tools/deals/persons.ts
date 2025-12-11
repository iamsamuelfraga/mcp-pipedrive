import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListDealPersonsSchema } from '../../schemas/deal.js';

export function getPersonTools(client: PipedriveClient) {
  return {
    'deals_list_persons': {
      description: `List all persons associated with a deal.

Returns all persons (contacts) linked to a specific deal, including the primary contact and any participants.

Workflow tips:
- Shows both primary contact and participants
- Includes full person details (name, email, phone, etc.)
- Use pagination for deals with many contacts
- Cached for 5 minutes
- Different from participants (participants are just person references)

Common use cases:
- List all contacts: { "id": 123 }
- Paginated results: { "id": 123, "start": 0, "limit": 50 }
- Get contact information for outreach
- Review all stakeholders in a deal
- Export contact list for communication`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal' },
          start: { type: 'number', description: 'Pagination start', default: 0 },
          limit: { type: 'number', description: 'Number of items to return per page' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, ...params } = ListDealPersonsSchema.parse(args);
        return client.get(`/deals/${id}/persons`, params, { enabled: true, ttl: 300000 });
      },
    },
  };
}
