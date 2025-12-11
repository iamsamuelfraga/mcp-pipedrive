import type { PipedriveClient } from '../../pipedrive-client.js';

export function getListOrganizationFieldsTool(client: PipedriveClient) {
  return {
    'fields/list_organization_fields': {
      description: `Get all field definitions for organizations, including custom fields.

Use this to discover what fields are available before creating or updating organizations. Returns field keys, types, validation rules, and whether fields are required.

Response includes:
- Field ID and key (use key in API requests)
- Field name and type (varchar, text, enum, address, etc.)
- Validation info (mandatory, editable, searchable)
- Options for enum/dropdown fields
- Filtering and sorting capabilities

Cached for 15 minutes as field definitions rarely change.

Common use cases:
- Discover custom fields before creating organizations
- Check field types and validation rules
- Find field keys for API requests
- Understand available enum options for organization fields`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
      handler: async () => {
        return client.get('/organizationFields', undefined, {
          enabled: true,
          ttl: 900000, // 15 minutes
        });
      },
    },
  };
}
