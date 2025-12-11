import type { PipedriveClient } from '../../pipedrive-client.js';
import { UniversalSearchSchema } from '../../schemas/search.js';

export function getUniversalSearchTool(client: PipedriveClient) {
  return {
    'search_universal': {
      description: `Search across all Pipedrive entities (deals, persons, organizations, products, leads, files).

Performs a universal search that can search across multiple item types simultaneously.

Workflow tips:
- Search term must be at least 2 characters (1 if exact_match is true)
- Specify item_types to limit search to specific entities
- Use exact_match=true for precise searches
- search_for_related_items=true includes up to 100 related items
- Results include result_score for relevance ranking
- Can search specific fields using the fields parameter

Common use cases:
- Search everything: { "term": "acme" }
- Search deals only: { "term": "contract", "item_types": ["deal"] }
- Search persons and orgs: { "term": "john", "item_types": ["person", "organization"] }
- Exact match search: { "term": "John Smith", "exact_match": true }
- Search specific fields: { "term": "email@example.com", "fields": "email,phone" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          term: { type: 'string', description: 'Search term (min 2 chars, 1 if exact_match)' },
          item_types: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['deal', 'person', 'organization', 'product', 'lead', 'file'],
            },
            description: 'Array of item types to search',
          },
          fields: { type: 'string', description: 'Comma-separated field names to search' },
          exact_match: { type: 'boolean', description: 'Perform exact match search' },
          search_for_related_items: {
            type: 'boolean',
            description: 'Include up to 100 related items in results',
            default: true,
          },
          start: { type: 'number', description: 'Pagination start', default: 0 },
          limit: { type: 'number', description: 'Number of items to return', default: 100 },
        },
        required: ['term'],
      },
      handler: async (args: unknown) => {
        const validated = UniversalSearchSchema.parse(args);
        const { start, limit, item_types, ...filters } = validated;

        const params: Record<string, string | number | boolean> = {
          ...filters,
          start: start ?? 0,
          limit: limit ?? 100,
        };

        if (item_types) {
          params.item_types = item_types.join(',');
        }

        return client.get(
          '/itemSearch',
          params,
          { enabled: true, ttl: 60000 } // Cache for 1 minute
        );
      },
    },
  };
}
