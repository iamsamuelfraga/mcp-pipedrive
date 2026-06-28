import type { PipedriveClient } from '../../pipedrive-client.js';

export function getListLeadFieldsTool(client: PipedriveClient) {
  return {
    fields_list_lead_fields: {
      description: `Get all field definitions available for leads, including custom fields.

Leads share their custom field structure with deals, but this endpoint returns the
canonical list as it applies to leads. Read-only — to create/update/delete the underlying
custom fields, use the deal field tools (\`fields_create_deal_field\`, etc.).

Cached for 15 minutes as field definitions rarely change.

Common use cases:
- Discover field keys before creating/updating leads
- Check field types and validation rules`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
      handler: async () => {
        return client.get('/leadFields', undefined, {
          enabled: true,
          ttl: 900000, // 15 minutes
        });
      },
    },
  };
}
