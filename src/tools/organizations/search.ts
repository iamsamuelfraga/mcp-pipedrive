import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Organization } from '../../types/pipedrive-api.js';
import type { PaginatedResponse } from '../../utils/pagination.js';

const SearchOrganizationsArgsSchema = z.object({
  term: z.string().describe('Search term'),
  fields: z.string().optional().describe('Comma-separated field names to search (e.g., "name,address")'),
  exact_match: z.boolean().optional().describe('When true, only full exact matches are returned'),
  start: z.number().default(0).describe('Pagination start'),
  limit: z.number().default(100).describe('Items per page'),
});

export function createSearchOrganizationsTool(client: PipedriveClient) {
  return {
    name: 'organizations/search',
    description: 'Search organizations by name or other fields. Returns matching organizations.',
    inputSchema: {
      type: 'object',
      properties: {
        term: { type: 'string', description: 'Search term' },
        fields: { type: 'string', description: 'Comma-separated field names to search (e.g., "name,address")' },
        exact_match: { type: 'boolean', description: 'When true, only full exact matches are returned' },
        start: { type: 'number', description: 'Pagination start', default: 0 },
        limit: { type: 'number', description: 'Items per page', default: 100 },
      },
      required: ['term'],
    },
    handler: async (args: unknown) => {
      const parsed = SearchOrganizationsArgsSchema.parse(args);

      const params: Record<string, string | number | boolean> = {
        term: parsed.term,
        start: parsed.start,
        limit: parsed.limit,
      };

      if (parsed.fields !== undefined) params.fields = parsed.fields;
      if (parsed.exact_match !== undefined) params.exact_match = parsed.exact_match;

      const response = await client.get<PaginatedResponse<Organization>>(
        '/organizations/search',
        params,
        { enabled: true, ttl: 30000 }
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
