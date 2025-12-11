import type { PipedriveClient } from '../../pipedrive-client.js';

export function getListPersonFieldsTool(client: PipedriveClient) {
  return {
    'fields/list_person_fields': {
      description: `Get all field definitions for persons (contacts), including custom fields.

Use this to discover what fields are available before creating or updating persons. Returns field keys, types, validation rules, and whether fields are required.

Response includes:
- Field ID and key (use key in API requests)
- Field name and type (varchar, text, enum, phone, email, etc.)
- Validation info (mandatory, editable, searchable)
- Options for enum/dropdown fields
- Filtering and sorting capabilities

Cached for 15 minutes as field definitions rarely change.

Common use cases:
- Discover custom fields before creating persons
- Check field types and validation rules
- Find field keys for API requests
- Understand available enum options for person fields`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
      handler: async () => {
        return client.get('/personFields', undefined, {
          enabled: true,
          ttl: 900000, // 15 minutes
        });
      },
    },
  };
}
