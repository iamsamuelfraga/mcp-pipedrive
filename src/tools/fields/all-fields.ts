import type { PipedriveClient } from '../../pipedrive-client.js';

export function getListAllFieldsTool(client: PipedriveClient) {
  return {
    'fields/list_all_fields': {
      description: `Get ALL field definitions across all entity types in a single call.

This is a convenient aggregator that fetches field definitions for deals, persons, organizations, activities, and products in one request. Useful for getting a complete overview of all custom fields in your Pipedrive account.

Returns an object with fields grouped by entity type:
- deal_fields: All deal field definitions
- person_fields: All person field definitions
- organization_fields: All organization field definitions
- activity_fields: All activity field definitions
- product_fields: All product field definitions

Each field includes:
- Field ID, key, and name
- Field type and validation rules
- Options for enum fields
- Flags: mandatory, editable, searchable, filterable, sortable

Cached for 15 minutes as field definitions rarely change.

Common use cases:
- Get complete field overview across all entities
- Build field mapping documentation
- Audit custom fields setup
- Prepare for data migration or integration`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
      handler: async () => {
        // Fetch all field types in parallel
        const [dealFields, personFields, orgFields, activityFields, productFields] =
          await Promise.all([
            client.get('/dealFields', undefined, { enabled: true, ttl: 900000 }),
            client.get('/personFields', undefined, { enabled: true, ttl: 900000 }),
            client.get('/organizationFields', undefined, { enabled: true, ttl: 900000 }),
            client.get('/activityFields', undefined, { enabled: true, ttl: 900000 }),
            client.get('/productFields', undefined, { enabled: true, ttl: 900000 }),
          ]);

        return {
          deal_fields: dealFields,
          person_fields: personFields,
          organization_fields: orgFields,
          activity_fields: activityFields,
          product_fields: productFields,
        };
      },
    },
  };
}
