import type { PipedriveClient } from '../../pipedrive-client.js';
import { z } from 'zod';

const GetFieldSchema = z.object({
  entity_type: z.enum(['deal', 'person', 'organization', 'activity', 'product'], {
    description: 'Type of entity (deal, person, organization, activity, product)',
  }),
  field_id: z.number({ description: 'Field ID to retrieve' }),
});

export function getGetFieldTool(client: PipedriveClient) {
  return {
    'fields/get_field': {
      description: `Get details of a specific field by ID and entity type.

Retrieves complete information about a single field definition, including all validation rules, options, and metadata.

Response includes:
- Field ID, key, and name
- Field type and validation rules
- Options for enum fields
- Flags: mandatory, editable, searchable, filterable, sortable, bulk_edit_allowed

Cached for 15 minutes as field definitions rarely change.

Common use cases:
- Get specific field details: { "entity_type": "deal", "field_id": 12345 }
- Check field validation rules before updating
- Retrieve enum options for a dropdown field`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          entity_type: {
            type: 'string',
            enum: ['deal', 'person', 'organization', 'activity', 'product'],
            description: 'Type of entity (deal, person, organization, activity, product)',
          },
          field_id: {
            type: 'number',
            description: 'Field ID to retrieve',
          },
        },
        required: ['entity_type', 'field_id'],
      },
      handler: async (args: unknown) => {
        const { entity_type, field_id } = GetFieldSchema.parse(args);

        const endpointMap = {
          deal: 'dealFields',
          person: 'personFields',
          organization: 'organizationFields',
          activity: 'activityFields',
          product: 'productFields',
        };

        const endpoint = `/${endpointMap[entity_type]}/${field_id}`;

        return client.get(endpoint, undefined, {
          enabled: true,
          ttl: 900000, // 15 minutes
        });
      },
    },
  };
}
