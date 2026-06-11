import type { PipedriveClient } from '../../pipedrive-client.js';
import { UpdateLeadSchema } from '../../schemas/lead.js';
import { resolveCustomFieldsForEntity } from '../../utils/custom-fields.js';

export function getUpdateLeadTool(client: PipedriveClient) {
  return {
    leads_update: {
      description: `Update an existing lead in Pipedrive.

Updates one or more properties of a lead. Only properties included in the request will be updated.
Send null to unset a property (applicable for value, person_id, or organization_id).

Custom fields:
- Pass display names: { "custom_fields": { "Source": "Web", "Budget": 5000 } }
- Or hash keys directly: { "custom_fields": { "abc123...": "raw value" } }
- Uses deal field definitions (leads share the deal custom fields).

Workflow tips:
- Only include fields you want to update
- Lead ID must be a UUID
- Use null to clear optional fields
- value must be an object with amount and currency
- Leads inherit custom fields structure from deals
- Set is_archived to true to archive a lead

Common use cases:
- Update title: { "id": "<uuid>", "title": "Updated Title" }
- Update value: { "id": "<uuid>", "value": { "amount": 10000, "currency": "USD" } }
- Archive lead: { "id": "<uuid>", "is_archived": true }
- Clear person: { "id": "<uuid>", "person_id": null }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'string',
            description: 'UUID of the lead to update (required)',
          },
          title: { type: 'string', description: 'Lead title' },
          owner_id: { type: 'number', description: 'ID of the user who will own this lead' },
          label_ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of label UUIDs',
          },
          person_id: {
            type: 'number',
            description: 'ID of the person associated with this lead (null to clear)',
          },
          organization_id: {
            type: 'number',
            description: 'ID of the organization associated with this lead (null to clear)',
          },
          is_archived: { type: 'boolean', description: 'Whether the lead is archived' },
          value: {
            type: 'object',
            properties: {
              amount: { type: 'number', description: 'Lead value amount' },
              currency: { type: 'string', description: '3-letter currency code' },
            },
            description: 'Lead value with amount and currency (null to clear)',
          },
          expected_close_date: {
            type: 'string',
            description: 'Expected close date in YYYY-MM-DD format',
          },
          visible_to: {
            type: 'string',
            enum: ['1', '3', '5', '7'],
            description: 'Visibility level',
          },
          was_seen: { type: 'boolean', description: 'Whether the lead was seen' },
          channel: { type: 'number', description: 'Channel ID' },
          channel_id: { type: 'string', description: 'Channel identifier string' },
          custom_fields: {
            type: 'object',
            description:
              'Custom field values keyed by display name or hash. Uses deal field definitions.',
            additionalProperties: true,
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = UpdateLeadSchema.parse(args);
        const { id, custom_fields, ...updates } = validated;
        const resolved = await resolveCustomFieldsForEntity(client, 'lead', custom_fields);
        return client.put(`/leads/${id}`, { ...updates, ...resolved });
      },
    },
  };
}
