import type { PipedriveClient } from '../../pipedrive-client.js';

export function getListDealFieldsTool(client: PipedriveClient) {
  return {
    'fields_list_deal_fields': {
      description: `Get all field definitions for deals, including custom fields.

Use this to discover what fields are available before creating or updating deals. Returns field keys, types, validation rules, and whether fields are required.

Response includes:
- Field ID and key (use key in API requests)
- Field name and type (varchar, text, enum, date, monetary, etc.)
- Validation info (mandatory, editable, searchable)
- Options for enum/dropdown fields
- Filtering and sorting capabilities

Cached for 15 minutes as field definitions rarely change.

Common use cases:
- Discover custom fields before creating deals
- Check field types and validation rules
- Find field keys for API requests
- Understand available enum options`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
      handler: async () => {
        return client.get('/dealFields', undefined, {
          enabled: true,
          ttl: 900000, // 15 minutes
        });
      },
    },
  };
}
