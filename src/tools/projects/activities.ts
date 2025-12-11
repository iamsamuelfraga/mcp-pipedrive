import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Activity } from '../../types/pipedrive-api.js';

const GetProjectActivitiesArgsSchema = z.object({
  id: z.number().positive().describe('Project ID'),
});

interface CursorPaginatedResponse<T> {
  success: boolean;
  data: T[];
  additional_data?: {
    next_cursor?: string;
  };
}

export function createGetProjectActivitiesTool(client: PipedriveClient) {
  return {
    name: 'projects/activities/list',
    description:
      'Get all activities linked to a specific project. Returns activity details including type, due date, and completion status.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Project ID' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = GetProjectActivitiesArgsSchema.parse(args);

      const response = await client.get<CursorPaginatedResponse<Activity>>(
        `/projects/${parsed.id}/activities`,
        {},
        { enabled: true, ttl: 300000 } // 5 min cache
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
