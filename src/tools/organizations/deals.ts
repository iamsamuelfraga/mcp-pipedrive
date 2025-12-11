import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Deal } from '../../types/pipedrive-api.js';
import type { PaginatedResponse } from '../../utils/pagination.js';

const ListOrganizationDealsArgsSchema = z.object({
  id: z.number().describe('Organization ID'),
  status: z
    .enum(['open', 'won', 'lost', 'deleted', 'all_not_deleted'])
    .optional()
    .describe('Deal status filter'),
  start: z.number().default(0).describe('Pagination start'),
  limit: z.number().default(100).describe('Items per page'),
});

export function createListOrganizationDealsTool(client: PipedriveClient) {
  return {
    name: 'organizations_list_deals',
    description: 'List all deals associated with a specific organization.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Organization ID' },
        status: {
          type: 'string',
          enum: ['open', 'won', 'lost', 'deleted', 'all_not_deleted'],
          description: 'Deal status filter',
        },
        start: { type: 'number', description: 'Pagination start', default: 0 },
        limit: { type: 'number', description: 'Items per page', default: 100 },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = ListOrganizationDealsArgsSchema.parse(args);

      const params: Record<string, string | number | boolean> = {
        start: parsed.start,
        limit: parsed.limit,
      };

      if (parsed.status !== undefined) params.status = parsed.status;

      const response = await client.get<PaginatedResponse<Deal>>(
        `/organizations/${parsed.id}/deals`,
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
