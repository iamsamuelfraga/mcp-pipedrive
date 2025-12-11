import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Activity } from '../../types/pipedrive-api.js';

const ListAllActivitiesArgsSchema = z.object({
  user_id: z.number().optional().describe('Filter by user ID'),
  type: z.enum(['call', 'meeting', 'task', 'deadline', 'email', 'lunch']).optional().describe('Activity type'),
  done: z.boolean().optional().describe('Filter by done status (true for done, false for not done)'),
  start_date: z.string().optional().describe('Start date filter (YYYY-MM-DD)'),
  end_date: z.string().optional().describe('End date filter (YYYY-MM-DD)'),
  max_items: z.number().optional().describe('Maximum number of items to fetch'),
});

export function createListAllActivitiesTool(client: PipedriveClient) {
  return {
    name: 'activities/list_all_auto',
    description: 'Automatically fetch all activities across all pages. Use this when you need complete data without manual pagination.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', description: 'Filter by user ID' },
        type: {
          type: 'string',
          enum: ['call', 'meeting', 'task', 'deadline', 'email', 'lunch'],
          description: 'Activity type'
        },
        done: { type: 'boolean', description: 'Filter by done status (true for done, false for not done)' },
        start_date: { type: 'string', description: 'Start date filter (YYYY-MM-DD)' },
        end_date: { type: 'string', description: 'End date filter (YYYY-MM-DD)' },
        max_items: { type: 'number', description: 'Maximum number of items to fetch' },
      },
    },
    handler: async (args: unknown) => {
      const parsed = ListAllActivitiesArgsSchema.parse(args);

      const params: Record<string, string | number | boolean> = {};

      if (parsed.user_id !== undefined) params.user_id = parsed.user_id;
      if (parsed.type !== undefined) params.type = parsed.type;
      if (parsed.done !== undefined) params.done = parsed.done ? 1 : 0;
      if (parsed.start_date !== undefined) params.start_date = parsed.start_date;
      if (parsed.end_date !== undefined) params.end_date = parsed.end_date;

      const paginator = client.createPaginator<Activity>('/activities', params);
      const activities = await paginator.fetchAll(100, parsed.max_items);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                data: activities,
                count: activities.length,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  };
}
