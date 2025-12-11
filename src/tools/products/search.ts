import type { PipedriveClient } from '../../pipedrive-client.js';
import { SearchProductsSchema } from '../../schemas/product.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for searching products
 */
export function getSearchProductsTool(client: PipedriveClient) {
  return {
    name: 'products/search',
    description: `Search for products by name, code, or custom fields.

This is a powerful search tool that finds products matching your query across multiple fields.

Search features:
- Searches product name, code, and custom fields by default
- Minimum 1 character required (or use exact_match for single chars)
- Returns relevance-scored results
- Supports pagination

Use cases:
- Finding products by partial name
- Looking up products by code/SKU
- Searching custom product attributes
- Quick product lookup during deal creation`,
    inputSchema: {
      type: 'object',
      properties: {
        term: {
          type: 'string',
          description: 'Search term (minimum 1 character)',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated fields to search (optional)',
        },
        exact_match: {
          type: 'boolean',
          description: 'Only return exact matches (not case sensitive)',
        },
        include_fields: {
          type: 'string',
          description: 'Additional fields to include in response',
        },
        start: {
          type: 'number',
          description: 'Pagination start (default: 0)',
        },
        limit: {
          type: 'number',
          description: 'Items per page, max 500',
        },
      },
      required: ['term'],
    } as const,
    handler: async (params: unknown) => {
      const validated = SearchProductsSchema.parse(params);

      const queryParams: Record<string, string | number | boolean> = {
        term: validated.term,
        start: validated.start,
      };

      if (validated.fields) queryParams.fields = validated.fields;
      if (validated.exact_match !== undefined) queryParams.exact_match = validated.exact_match;
      if (validated.include_fields) queryParams.include_fields = validated.include_fields;
      if (validated.limit) queryParams.limit = validated.limit;

      const response = await client.get<PipedriveResponse<unknown>>(
        '/products/search',
        queryParams,
        { enabled: true, ttl: 60000 } // Cache for 1 minute
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    },
  };
}
