import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Activity } from '../../types/pipedrive-api.js';
import type { PaginatedResponse } from '../../utils/pagination.js';

const ListActivitiesArgsSchema = z.object({
  user_id: z.number().optional().describe('Filter by user ID'),
  type: z
    .enum(['call', 'meeting', 'task', 'deadline', 'email', 'lunch'])
    .optional()
    .describe('Activity type'),
  done: z
    .boolean()
    .optional()
    .describe('Filter by done status (true for done, false for not done)'),
  start_date: z.string().optional().describe('Start date filter (YYYY-MM-DD)'),
  end_date: z.string().optional().describe('End date filter (YYYY-MM-DD)'),
  start: z.number().default(0).describe('Pagination start'),
  limit: z.number().default(100).describe('Items per page (max 500)'),
});

export function createListActivitiesTool(client: PipedriveClient) {
  return {
    name: 'activities_list',
    description:
      'List activities with pagination and filtering options. Can filter by user, type, done status, and date range.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', description: 'Filter by user ID' },
        type: {
          type: 'string',
          enum: ['call', 'meeting', 'task', 'deadline', 'email', 'lunch'],
          description: 'Activity type',
        },
        done: {
          type: 'boolean',
          description: 'Filter by done status (true for done, false for not done)',
        },
        start_date: { type: 'string', description: 'Start date filter (YYYY-MM-DD)' },
        end_date: { type: 'string', description: 'End date filter (YYYY-MM-DD)' },
        start: { type: 'number', description: 'Pagination start', default: 0 },
        limit: { type: 'number', description: 'Items per page (max 500)', default: 100 },
      },
    },
    handler: async (args: unknown) => {
      const parsed = ListActivitiesArgsSchema.parse(args);

      const params: Record<string, string | number | boolean> = {
        start: parsed.start,
        limit: parsed.limit,
      };

      if (parsed.user_id !== undefined) params.user_id = parsed.user_id;
      if (parsed.type !== undefined) params.type = parsed.type;
      if (parsed.done !== undefined) params.done = parsed.done ? 1 : 0;
      if (parsed.start_date !== undefined) params.start_date = parsed.start_date;
      if (parsed.end_date !== undefined) params.end_date = parsed.end_date;

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
