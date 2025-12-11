import type { PipedriveClient } from '../../pipedrive-client.js';
import { SearchProductsSchema } from '../../schemas/search.js';

export function getSearchProductsTool(client: PipedriveClient) {
  return {
    'search/products': {
      description: `Search for products with advanced filtering options.

Performs a product-specific search across all product fields.

Workflow tips:
- Search term must be at least 2 characters
- Specify fields to search: name, code, description, custom fields
- Use include_fields to limit response data
- Use exact_match for precise searches (e.g., SKU lookup)
- Results ordered by relevance
- Useful for finding products by name, code, or SKU

Common use cases:
- Search by name: { "term": "premium subscription" }
- Search by code/SKU: { "term": "SKU-123", "fields": "code" }
- Exact product match: { "term": "PRD-001", "exact_match": true }
- Search description: { "term": "enterprise", "fields": "description" }
- Limit response: { "term": "product", "include_fields": "name,code,price" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          term: { type: 'string', description: 'Search term (min 2 chars)' },
          fields: { type: 'string', description: 'Comma-separated field names to search' },
          exact_match: { type: 'boolean', description: 'Perform exact match search', default: false },
          include_fields: {
            type: 'string',
            description: 'Comma-separated fields to include in response',
          },
          start: { type: 'number', description: 'Pagination start', default: 0 },
          limit: { type: 'number', description: 'Number of items to return', default: 100 },
        },
        required: ['term'],
      },
      handler: async (args: unknown) => {
        const validated = SearchProductsSchema.parse(args);
        const { start, limit, ...filters } = validated;

        return client.get(
          '/products/search',
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
