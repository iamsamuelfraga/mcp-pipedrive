import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListFiltersSchema } from '../../schemas/filter.js';

export function getListFiltersTools(client: PipedriveClient) {
  return {
    'filters_list': {
      description: `List all filters in Pipedrive.

Returns data about all filters. Each filter is a set of conditions used to filter items.

Workflow tips:
- Use type parameter to filter by entity type (deals, org, people, products, activities)
- Without type parameter, returns all filters across all types
- Filters can be applied when fetching lists of deals, leads, persons, organizations, or products
- Results are heavily cached for 15 minutes for optimal performance

Common use cases:
- List all filters: {}
- List deal filters only: { "type": "deals" }
- List organization filters: { "type": "org" }
- List people filters: { "type": "people" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          type: {
            type: 'string',
            enum: ['deals', 'org', 'people', 'products', 'activities'],
            description: 'Filter by type (optional)',
          },
        },
      },
      handler: async (args: unknown) => {
        const validated = ListFiltersSchema.parse(args);

        return client.get(
          '/filters',
          validated,
          { enabled: true, ttl: 900000 } // Cache for 15 minutes
        );
      },
    },
  };
}
