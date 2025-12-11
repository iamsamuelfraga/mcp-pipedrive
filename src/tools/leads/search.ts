import type { PipedriveClient } from '../../pipedrive-client.js';
import { SearchLeadsSchema } from '../../schemas/lead.js';

export function getSearchLeadsTool(client: PipedriveClient) {
  return {
    'leads_search': {
      description: `Search leads by title, notes, and custom fields.

Searches all leads by title, notes, and/or custom fields using a search term.
This is a wrapper of /v1/itemSearch with a narrower OAuth scope.

Workflow tips:
- Minimum 2 characters for search term (or 1 with exact_match)
- Use exact_match for case-insensitive exact matching
- Filter results by person_id or organization_id (max 2000 leads each)
- fields parameter specifies which fields to search (comma-separated)
- Results include result_score for relevance ranking
- Use start/limit for pagination

Common use cases:
- Search by title: { "term": "acme" }
- Exact match: { "term": "Acme Corp", "exact_match": true }
- Search for person's leads: { "term": "deal", "person_id": 123 }
- Search org's leads: { "term": "proposal", "organization_id": 456 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          term: {
            type: 'string',
            description: 'Search term (min 2 chars, or 1 with exact_match)',
          },
          fields: {
            type: 'string',
            description: 'Comma-separated fields to search (defaults to all)',
          },
          exact_match: {
            type: 'boolean',
            description: 'Enable exact match search (case insensitive)',
            default: false,
          },
          person_id: {
            type: 'number',
            description: 'Filter by person ID (max 2000 leads)',
          },
          organization_id: {
            type: 'number',
            description: 'Filter by organization ID (max 2000 leads)',
          },
          include_fields: {
            type: 'string',
            description: 'Comma-separated optional fields to include',
          },
          start: {
            type: 'number',
            description: 'Pagination start',
            default: 0,
          },
          limit: {
            type: 'number',
            description: 'Items shown per page (max 500)',
          },
        },
        required: ['term'],
      },
      handler: async (args: unknown) => {
        const validated = SearchLeadsSchema.parse(args);

        return client.get(
          '/leads/search',
          validated,
          { enabled: true, ttl: 180000 } // Cache for 3 minutes
        );
      },
    },
  };
}
