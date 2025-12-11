import type { PipedriveClient } from '../../pipedrive-client.js';
import { CreateLeadSchema } from '../../schemas/lead.js';

export function getCreateLeadTool(client: PipedriveClient) {
  return {
    'leads/create': {
      description: `Create a new lead in Pipedrive.

Creates a new lead with the specified information. A lead must be linked to a person or an organization (or both).
All leads created through the API will have source_name "API" and origin "API".

Workflow tips:
- Title is required
- Must have person_id, organization_id, or both
- Use persons/search or organizations/search to get IDs
- Value is optional but recommended (object with amount and currency)
- Leads inherit custom fields structure from deals
- Set expected_close_date in YYYY-MM-DD format
- label_ids is an array of UUID strings

Common use cases:
- Simple lead: { "title": "New Lead", "person_id": 123 }
- Lead with value: { "title": "Lead", "person_id": 123, "value": { "amount": 5000, "currency": "USD" } }
- Lead with org: { "title": "Company Lead", "organization_id": 456 }
- Full lead: { "title": "Big Lead", "person_id": 123, "organization_id": 456, "value": { "amount": 50000, "currency": "USD" }, "expected_close_date": "2024-12-31", "owner_id": 1 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          title: { type: 'string', description: 'Lead title (required)' },
          owner_id: { type: 'number', description: 'ID of the user who will own this lead' },
          label_ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of label UUIDs'
          },
          person_id: { type: 'number', description: 'ID of the person this lead is associated with' },
          organization_id: { type: 'number', description: 'ID of the organization this lead is associated with' },
          value: {
            type: 'object',
            properties: {
              amount: { type: 'number', description: 'Lead value amount' },
              currency: { type: 'string', description: '3-letter currency code (e.g., USD, EUR)' }
            },
            description: 'Lead value with amount and currency'
          },
          expected_close_date: { type: 'string', description: 'Expected close date in YYYY-MM-DD format' },
          visible_to: {
            type: 'string',
            enum: ['1', '3', '5', '7'],
            description: 'Visibility: 1=Owner, 3=Owner\'s group, 5=Owner\'s group and sub-groups, 7=Entire company',
          },
          was_seen: {
            type: 'boolean',
            description: 'Whether the lead was seen'
          },
          origin_id: { type: 'string', description: 'Origin ID for tracking' },
          channel: { type: 'number', description: 'Channel ID' },
          channel_id: { type: 'string', description: 'Channel identifier string' },
        },
        required: ['title'],
      },
      handler: async (args: unknown) => {
        const validated = CreateLeadSchema.parse(args);
        return client.post('/leads', validated);
      },
    },
  };
}
