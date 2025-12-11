import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { ProjectTask } from '../../types/pipedrive-api.js';

const GetProjectTasksArgsSchema = z.object({
  id: z.number().positive().describe('Project ID'),
});

interface CursorPaginatedResponse<T> {
  success: boolean;
  data: T[];
  additional_data?: {
    next_cursor?: string;
  };
}

export function createGetProjectTasksTool(client: PipedriveClient) {
  return {
    name: 'projects/tasks/list',
    description:
      'Get all tasks linked to a specific project. Returns task details including assignee and completion status.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Project ID' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = GetProjectTasksArgsSchema.parse(args);

      const response = await client.get<CursorPaginatedResponse<ProjectTask>>(
        `/projects/${parsed.id}/tasks`,
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
