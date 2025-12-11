import type { PipedriveClient } from '../../pipedrive-client.js';
import { SearchByFieldSchema } from '../../schemas/search.js';

export function getSearchByFieldTool(client: PipedriveClient) {
  return {
    'search_by_field': {
      description: `Search for items by a specific field value.

Searches for items by targeting a specific field (custom or standard fields).

Workflow tips:
- Specify field_type: dealField, personField, organizationField, or productField
- Provide field_key: the API key of the field to search
- Use exact_match=true for precise matches
- return_item_ids=true returns only IDs instead of full objects
- Useful for searching custom fields

Common use cases:
- Search deal by custom field: { "term": "ABC123", "field_type": "dealField", "field_key": "custom_id" }
- Search person by email: { "term": "john@example.com", "field_type": "personField", "field_key": "email" }
- Search org by domain: { "term": "acme.com", "field_type": "organizationField", "field_key": "domain" }
- Get IDs only: { "term": "value", "field_type": "dealField", "field_key": "field", "return_item_ids": true }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          term: { type: 'string', description: 'Search term' },
          field_type: {
            type: 'string',
            enum: ['dealField', 'personField', 'organizationField', 'productField'],
            description: 'Type of field to search',
          },
          field_key: { type: 'string', description: 'API key of the field to search' },
          exact_match: {
            type: 'boolean',
            description: 'Perform exact match search',
            default: false,
          },
          return_item_ids: {
            type: 'boolean',
            description: 'Return item IDs instead of full objects',
            default: false,
          },
          start: { type: 'number', description: 'Pagination start', default: 0 },
          limit: { type: 'number', description: 'Number of items to return', default: 100 },
        },
        required: ['term', 'field_type', 'field_key'],
      },
      handler: async (args: unknown) => {
        const validated = SearchByFieldSchema.parse(args);
        const { start, limit, ...filters } = validated;

        return client.get(
          '/itemSearch/field',
          {
            ...filters,
            start: start ?? 0,
            limit: limit ?? 100,
          },
          { enabled: true, ttl: 60000 } // Cache for 1 minute
        );
      },
    },
  };
}
