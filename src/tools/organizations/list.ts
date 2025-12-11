import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Organization } from '../../types/pipedrive-api.js';
import type { PaginatedResponse } from '../../utils/pagination.js';

const ListOrganizationsArgsSchema = z.object({
  user_id: z.number().optional().describe('Filter by user ID'),
  filter_id: z.number().optional().describe('Filter by filter ID'),
  first_char: z.string().optional().describe('Filter by first character of name'),
  start: z.number().default(0).describe('Pagination start'),
  limit: z.number().default(100).describe('Items per page (max 500)'),
  sort: z.string().optional().describe('Field to sort by'),
});

export function createListOrganizationsTool(client: PipedriveClient) {
  return {
    name: 'organizations/list',
    description: 'List organizations with pagination support. Returns paginated list of organizations with filtering options.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', description: 'Filter by user ID' },
        filter_id: { type: 'number', description: 'Filter by filter ID' },
        first_char: { type: 'string', description: 'Filter by first character of name' },
        start: { type: 'number', description: 'Pagination start', default: 0 },
        limit: { type: 'number', description: 'Items per page (max 500)', default: 100 },
        sort: { type: 'string', description: 'Field to sort by' },
      },
    },
    handler: async (args: unknown) => {
      const parsed = ListOrganizationsArgsSchema.parse(args);

      const params: Record<string, string | number | boolean> = {
        start: parsed.start,
        limit: parsed.limit,
      };

      if (parsed.user_id !== undefined) params.user_id = parsed.user_id;
      if (parsed.filter_id !== undefined) params.filter_id = parsed.filter_id;
      if (parsed.first_char !== undefined) params.first_char = parsed.first_char;
      if (parsed.sort !== undefined) params.sort = parsed.sort;

      const response = await client.get<PaginatedResponse<Organization>>(
        '/organizations',
        params,
        { enabled: true, ttl: 60000 }
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
