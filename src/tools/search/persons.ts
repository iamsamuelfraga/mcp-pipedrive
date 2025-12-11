import type { PipedriveClient } from '../../pipedrive-client.js';
import { SearchPersonsSchema } from '../../schemas/search.js';

export function getSearchPersonsTool(client: PipedriveClient) {
  return {
    'search_persons': {
      description: `Search for persons with advanced filtering options.

Performs a person-specific search with additional filtering by organization.

Workflow tips:
- Search term must be at least 2 characters
- Filter by org_id to find persons in specific organizations
- Specify fields to search: name, email, phone, custom fields
- Use include_fields to limit response data
- Use exact_match for precise searches
- Results ordered by relevance

Common use cases:
- Search by name: { "term": "john smith" }
- Search by email: { "term": "john@example.com", "fields": "email" }
- Search in organization: { "term": "smith", "org_id": 123 }
- Search phone numbers: { "term": "+1234567890", "fields": "phone" }
- Limit response: { "term": "john", "include_fields": "name,email,phone" }`,
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
          org_id: { type: 'number', description: 'Filter by associated organization ID' },
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
        const validated = SearchPersonsSchema.parse(args);
        const { start, limit, ...filters } = validated;

        return client.get(
          '/persons/search',
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
