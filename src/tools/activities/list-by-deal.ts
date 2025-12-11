import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Activity } from '../../types/pipedrive-api.js';
import type { PaginatedResponse } from '../../utils/pagination.js';

const ListActivitiesByDealArgsSchema = z.object({
  deal_id: z.number().describe('Deal ID to filter activities by'),
  done: z
    .boolean()
    .optional()
    .describe('Filter by done status (true for done, false for not done)'),
  start: z.number().default(0).describe('Pagination start'),
  limit: z.number().default(100).describe('Items per page'),
});

export function createListActivitiesByDealTool(client: PipedriveClient) {
  return {
    name: 'activities/list_by_deal',
    description: 'List all activities associated with a specific deal.',
    inputSchema: {
      type: 'object',
      properties: {
        deal_id: { type: 'number', description: 'Deal ID to filter activities by' },
        done: {
          type: 'boolean',
          description: 'Filter by done status (true for done, false for not done)',
        },
        start: { type: 'number', description: 'Pagination start', default: 0 },
        limit: { type: 'number', description: 'Items per page', default: 100 },
      },
      required: ['deal_id'],
    },
    handler: async (args: unknown) => {
      const parsed = ListActivitiesByDealArgsSchema.parse(args);

      const params: Record<string, string | number | boolean> = {
        deal_id: parsed.deal_id,
        start: parsed.start,
        limit: parsed.limit,
      };

      if (parsed.done !== undefined) params.done = parsed.done ? 1 : 0;

      const response = await client.get<PaginatedResponse<Activity>>('/activities', params, {
        enabled: true,
        ttl: 30000,
      });

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
