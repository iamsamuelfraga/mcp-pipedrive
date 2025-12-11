import type { PipedriveClient } from '../../pipedrive-client.js';
import { DuplicateDealSchema } from '../../schemas/deal.js';

export function getDuplicateDealTool(client: PipedriveClient) {
  return {
    'deals_duplicate': {
      description: `Duplicate an existing deal.

Creates a copy of an existing deal with all its properties. The new deal will have the same values, person, organization, etc.

Workflow tips:
- Creates exact copy except for ID and timestamps
- Followers are NOT copied to the new deal
- Products attached to the deal ARE copied
- Use deals/get to view the original before duplicating
- After duplication, you may want to update the title

Common use cases:
- Duplicate template deal: { "id": 123 }
- Create similar deal: { "id": 456 }
- Workflow: duplicate deal, then update specific fields`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal to duplicate' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = DuplicateDealSchema.parse(args);
        return client.post(`/deals/${id}/duplicate`);
      },
    },
  };
}
