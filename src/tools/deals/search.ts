import type { PipedriveClient } from '../../pipedrive-client.js';
import { SearchDealsSchema } from '../../schemas/deal.js';

export function getSearchDealsTool(client: PipedriveClient) {
  return {
    'deals/search': {
      description: `Search for deals using a text query.

Searches deals by title, notes, or custom fields. Much faster than filtering all deals.

Workflow tips:
- Search is case-insensitive by default
- Minimum 2 characters for search term
- Use exact_match=true for precise matching
- Combine with person_id or org_id to narrow results
- Use status filter to search only open/won/lost deals
- Results are cached for 5 minutes

Common use cases:
- Search by title: { "term": "acme" }
- Exact match: { "term": "ACME Corp Deal", "exact_match": true }
- Search for person's deals: { "term": "software", "person_id": 123 }
- Search open deals only: { "term": "contract", "status": "open" }
- Search in specific field: { "term": "urgent", "fields": "notes" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          term: { type: 'string', description: 'Search term (minimum 2 characters)' },
          fields: {
            type: 'string',
            enum: ['title', 'notes', 'custom_fields', 'all'],
            description: 'Fields to search in (default: all)',
          },
          exact_match: {
            type: 'boolean',
            description: 'Whether to perform exact match search',
          },
          person_id: { type: 'number', description: 'Filter by person ID' },
          org_id: { type: 'number', description: 'Filter by organization ID' },
          status: {
            type: 'string',
            enum: ['open', 'won', 'lost', 'deleted', 'all_not_deleted'],
            description: 'Filter by deal status',
          },
          include_fields: {
            type: 'string',
            description: 'Comma-separated list of fields to include in response',
          },
          start: { type: 'number', description: 'Pagination start', default: 0 },
          limit: { type: 'number', description: 'Number of items to return (max 500)' },
        },
        required: ['term'],
      },
      handler: async (args: unknown) => {
        const validated = SearchDealsSchema.parse(args);
        return client.get('/deals/search', validated, { enabled: true, ttl: 300000 });
      },
    },
  };
}
