import type { PipedriveClient } from '../../pipedrive-client.js';
import { SearchOrganizationsSchema } from '../../schemas/search.js';

export function getSearchOrganizationsTool(client: PipedriveClient) {
  return {
    'search/organizations': {
      description: `Search for organizations with advanced filtering options.

Performs an organization-specific search across all organization fields.

Workflow tips:
- Search term must be at least 2 characters
- Specify fields to search: name, address, custom fields
- Use include_fields to limit response data
- Use exact_match for precise searches
- Results ordered by relevance
- Useful for finding companies by name or domain

Common use cases:
- Search by name: { "term": "acme corporation" }
- Search by address: { "term": "new york", "fields": "address" }
- Exact company match: { "term": "ACME Corp", "exact_match": true }
- Search custom field: { "term": "enterprise", "fields": "customer_type" }
- Limit response: { "term": "acme", "include_fields": "name,address,owner_id" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          term: { type: 'string', description: 'Search term (min 2 chars)' },
          fields: { type: 'string', description: 'Comma-separated field names to search' },
          exact_match: {
            type: 'boolean',
            description: 'Perform exact match search',
            default: false,
          },
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
        const validated = SearchOrganizationsSchema.parse(args);
        const { start, limit, ...filters } = validated;

        return client.get(
          '/organizations/search',
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
