import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetPersonDealsSchema } from '../../schemas/person.js';
import type { Deal } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for listing deals associated with a person
 */
export function getListPersonDealsTool(client: PipedriveClient) {
  return {
    name: 'persons/list_deals',
    description: `List all deals associated with a specific person.

Returns all deals where the person is linked, including:
- Deal details (title, value, stage, status)
- Timeline information
- Owner information
- Organization information

Filters:
- status: Filter by deal status (open, won, lost, deleted, all_not_deleted)
- sort: Sort by specific field

Supports pagination for large result sets.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Person ID',
        },
        start: {
          type: 'number',
          description: 'Pagination start (default: 0)',
        },
        limit: {
          type: 'number',
          description: 'Items per page, max 500 (default: 100)',
        },
        status: {
          type: 'string',
          description: 'Filter by deal status',
          enum: ['open', 'won', 'lost', 'deleted', 'all_not_deleted'],
        },
        sort: {
          type: 'string',
          description: 'Field to sort by (e.g., "title", "value")',
        },
      },
      required: ['id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = GetPersonDealsSchema.parse(params);

      const queryParams: Record<string, string | number | boolean> = {};

      if (validated.start !== undefined) queryParams.start = validated.start;
      if (validated.limit) queryParams.limit = validated.limit;
      if (validated.status) queryParams.status = validated.status;
      if (validated.sort) queryParams.sort = validated.sort;

      const response = await client.get<PipedriveResponse<Deal[]>>(
        `/persons/${validated.id}/deals`,
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
