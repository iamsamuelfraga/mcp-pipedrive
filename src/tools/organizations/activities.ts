import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Activity } from '../../types/pipedrive-api.js';
import type { PaginatedResponse } from '../../utils/pagination.js';

const ListOrganizationActivitiesArgsSchema = z.object({
  id: z.number().describe('Organization ID'),
  start: z.number().default(0).describe('Pagination start'),
  limit: z.number().default(100).describe('Items per page'),
  done: z
    .boolean()
    .optional()
    .describe('Filter by done status (true for done, false for not done)'),
});

export function createListOrganizationActivitiesTool(client: PipedriveClient) {
  return {
    name: 'organizations/list_activities',
    description: 'List all activities associated with a specific organization.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Organization ID' },
        start: { type: 'number', description: 'Pagination start', default: 0 },
        limit: { type: 'number', description: 'Items per page', default: 100 },
        done: {
          type: 'boolean',
          description: 'Filter by done status (true for done, false for not done)',
        },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = ListOrganizationActivitiesArgsSchema.parse(args);

      const params: Record<string, string | number | boolean> = {
        start: parsed.start,
        limit: parsed.limit,
      };

      if (parsed.done !== undefined) params.done = parsed.done ? 1 : 0;

      const response = await client.get<PaginatedResponse<Activity>>(
        `/organizations/${parsed.id}/activities`,
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
