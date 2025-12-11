import type { PipedriveClient } from '../../pipedrive-client.js';
import { SearchDealsSchema } from '../../schemas/search.js';

export function getSearchDealsTool(client: PipedriveClient) {
  return {
    'search_deals': {
      description: `Search for deals with advanced filtering options.

Performs a deal-specific search with additional filtering by person, organization, and status.

Workflow tips:
- Search term must be at least 2 characters
- Filter by person_id, org_id to narrow results
- Filter by status: open, won, lost, all_not_deleted
- Specify fields to search: title, notes, custom fields
- Use include_fields to limit response data
- Results ordered by relevance

Common use cases:
- Search deals by title: { "term": "contract" }
- Search open deals: { "term": "acme", "status": "open" }
- Search deals for person: { "term": "proposal", "person_id": 123 }
- Search specific fields: { "term": "urgent", "fields": "title,notes" }
- Limit response data: { "term": "deal", "include_fields": "title,value,stage_id" }`,
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
          person_id: { type: 'number', description: 'Filter by associated person ID' },
          org_id: { type: 'number', description: 'Filter by associated organization ID' },
          status: {
            type: 'string',
            enum: ['open', 'won', 'lost', 'all_not_deleted'],
            description: 'Filter by deal status',
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
        const validated = SearchDealsSchema.parse(args);
        const { start, limit, ...filters } = validated;

        return client.get(
          '/deals/search',
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
