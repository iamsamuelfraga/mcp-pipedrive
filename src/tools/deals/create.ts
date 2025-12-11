import type { PipedriveClient } from '../../pipedrive-client.js';
import { CreateDealSchema } from '../../schemas/deal.js';

export function getCreateDealTool(client: PipedriveClient) {
  return {
    'deals/create': {
      description: `Create a new deal in Pipedrive.

Creates a new deal with the specified information. Only title is required.

Workflow tips:
- Title is the only required field
- Use persons/search or organizations/search to get person_id or org_id
- Use pipelines/list to get pipeline_id and stage_id
- Set expected_close_date in YYYY-MM-DD format
- Probability should be 0-100 (percentage)
- Currency must be a 3-letter code (e.g., USD, EUR, GBP)

Common use cases:
- Simple deal: { "title": "New Deal", "value": 5000, "currency": "USD" }
- Deal with person: { "title": "Deal", "value": 1000, "person_id": 123 }
- Deal with organization: { "title": "Deal", "org_id": 456, "stage_id": 1 }
- Full deal: { "title": "Big Deal", "value": 50000, "currency": "USD", "person_id": 123, "org_id": 456, "pipeline_id": 1, "stage_id": 2, "expected_close_date": "2024-12-31" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          title: { type: 'string', description: 'Deal title (required)' },
          value: { type: 'number', description: 'Deal value' },
          currency: { type: 'string', description: '3-letter currency code (e.g., USD, EUR)' },
          user_id: { type: 'number', description: 'ID of the user who will own this deal' },
          person_id: {
            type: 'number',
            description: 'ID of the person this deal is associated with',
          },
          org_id: {
            type: 'number',
            description: 'ID of the organization this deal is associated with',
          },
          pipeline_id: { type: 'number', description: 'ID of the pipeline this deal will be in' },
          stage_id: { type: 'number', description: 'ID of the stage this deal will be in' },
          status: {
            type: 'string',
            enum: ['open', 'won', 'lost'],
            description: 'Deal status (default: open)',
          },
          expected_close_date: {
            type: 'string',
            description: 'Expected close date in YYYY-MM-DD format',
          },
          probability: { type: 'number', description: 'Deal success probability (0-100)' },
          lost_reason: { type: 'string', description: 'Reason why the deal was lost' },
          visible_to: {
            type: 'string',
            enum: ['1', '3', '5', '7'],
            description:
              "Visibility: 1=Owner, 3=Owner's group, 5=Owner's group and sub-groups, 7=Entire company",
          },
          add_time: { type: 'string', description: 'Creation time in ISO 8601 format' },
        },
        required: ['title'],
      },
      handler: async (args: unknown) => {
        const validated = CreateDealSchema.parse(args);
        return client.post('/deals', validated);
      },
    },
  };
}
