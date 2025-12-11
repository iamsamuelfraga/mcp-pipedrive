import type { PipedriveClient } from '../../pipedrive-client.js';
import { SearchPersonsSchema } from '../../schemas/person.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for searching persons
 */
export function getSearchPersonsTool(client: PipedriveClient) {
  return {
    name: 'persons_search',
    description: `Search for persons by name, email, phone, or notes.

The search uses Pipedrive's intelligent search that:
- Searches across multiple fields (name, email, phone, notes, custom fields)
- Supports fuzzy matching by default
- Returns ranked results

Search options:
- term: Search term (minimum 2 characters)
- fields: Specific fields to search in (default: all fields)
- exact_match: Use exact matching instead of fuzzy search
- org_id: Filter results by organization
- include_fields: Additional fields to include in response

The search is case-insensitive and supports partial matches.`,
    inputSchema: {
      type: 'object',
      properties: {
        term: {
          type: 'string',
          description: 'Search term (minimum 2 characters)',
        },
        fields: {
          type: 'string',
          description:
            'Fields to search in: name, email, phone, notes, custom_fields, or all (default: all)',
          enum: ['name', 'email', 'phone', 'notes', 'custom_fields', 'all'],
        },
        exact_match: {
          type: 'boolean',
          description: 'Use exact match instead of fuzzy search (default: false)',
        },
        org_id: {
          type: 'number',
          description: 'Filter by organization ID',
        },
        include_fields: {
          type: 'string',
          description: 'Comma-separated list of additional fields to include',
        },
        start: {
          type: 'number',
          description: 'Pagination start (default: 0)',
        },
        limit: {
          type: 'number',
          description: 'Number of results to return, max 500 (default: 100)',
        },
      },
      required: ['term'],
    } as const,
    handler: async (params: unknown) => {
      const validated = SearchPersonsSchema.parse(params);

      const queryParams: Record<string, string | number | boolean> = {
        term: validated.term,
      };

      if (validated.fields) queryParams.fields = validated.fields;
      if (validated.exact_match !== undefined) queryParams.exact_match = validated.exact_match;
      if (validated.org_id) queryParams.org_id = validated.org_id;
      if (validated.include_fields) queryParams.include_fields = validated.include_fields;
      if (validated.start !== undefined) queryParams.start = validated.start;
      if (validated.limit) queryParams.limit = validated.limit;

      const response = await client.get<PipedriveResponse<unknown[]>>(
        '/persons/search',
        queryParams,
        { enabled: true, ttl: 30000 } // Cache for 30 seconds
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
