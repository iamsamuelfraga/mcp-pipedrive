import type { PipedriveClient } from '../../pipedrive-client.js';
import { z } from 'zod';

const SearchFieldsSchema = z.object({
  query: z.string({ description: 'Search query to match against field names or keys' }),
  entity_type: z
    .enum(['deal', 'person', 'organization', 'activity', 'product', 'all'])
    .optional()
    .describe('Optional: Limit search to specific entity type. Default: "all"'),
});

export interface Field {
  id: number;
  key: string;
  name: string;
  field_type: string;
  [key: string]: unknown;
}

interface FieldsResponse {
  data?: Field[];
}

export function getSearchFieldsTool(client: PipedriveClient) {
  return {
    'fields_search_fields': {
      description: `Search for fields by name or key across entity types.

Searches field definitions by matching against field names (case-insensitive) or field keys. Useful for finding specific custom fields when you don't know the exact field ID.

Search is performed across:
- Field names (e.g., "Customer Type", "Lead Source")
- Field keys (e.g., "9dc80c50d78a...")

Results include:
- Entity type the field belongs to
- Field ID, key, and name
- Field type and validation info
- All other field metadata

Cached for 15 minutes as field definitions rarely change.

Common use cases:
- Find field by name: { "query": "customer" }
- Find field by partial key: { "query": "9dc80c" }
- Search in specific entity: { "query": "status", "entity_type": "deal" }
- Find all custom fields containing "date"`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          query: {
            type: 'string',
            description: 'Search query to match against field names or keys',
          },
          entity_type: {
            type: 'string',
            enum: ['deal', 'person', 'organization', 'activity', 'product', 'all'],
            description: 'Optional: Limit search to specific entity type. Default: "all"',
          },
        },
        required: ['query'],
      },
      handler: async (args: unknown) => {
        const { query, entity_type = 'all' } = SearchFieldsSchema.parse(args);
        const searchQuery = query.toLowerCase();

        // Determine which entity types to search
        const entitiesToSearch =
          entity_type === 'all'
            ? ['deal', 'person', 'organization', 'activity', 'product']
            : [entity_type];

        const endpointMap: Record<string, string> = {
          deal: '/dealFields',
          person: '/personFields',
          organization: '/organizationFields',
          activity: '/activityFields',
          product: '/productFields',
        };

        // Fetch fields from selected entity types in parallel
        const results = await Promise.all(
          entitiesToSearch.map(async (entityType) => {
            const response = (await client.get(endpointMap[entityType], undefined, {
              enabled: true,
              ttl: 900000, // 15 minutes
            })) as FieldsResponse;

            const fields = response.data || [];

            // Filter fields that match the search query
            const matchingFields = fields.filter(
              (field) =>
                field.name.toLowerCase().includes(searchQuery) ||
                field.key.toLowerCase().includes(searchQuery)
            );

            return {
              entity_type: entityType,
              matching_fields: matchingFields,
              match_count: matchingFields.length,
            };
          })
        );

        // Calculate total matches
        const totalMatches = results.reduce((sum, r) => sum + r.match_count, 0);

        // Filter out entity types with no matches
        const resultsWithMatches = results.filter((r) => r.match_count > 0);

        return {
          query,
          total_matches: totalMatches,
          searched_entity_types: entitiesToSearch,
          results: resultsWithMatches,
        };
      },
    },
  };
}
