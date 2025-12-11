import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { ProjectBoard } from '../../types/pipedrive-api.js';

const GetProjectBoardArgsSchema = z.object({
  id: z.number().positive().describe('Board ID'),
});

interface ListResponse<T> {
  success: boolean;
  data: T[];
}

interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export function createGetProjectBoardsTool(client: PipedriveClient) {
  return {
    name: 'projects_boards_list',
    description:
      'Get all project boards that are not deleted. Returns boards ordered by their order number.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async () => {
      const response = await client.get<ListResponse<ProjectBoard>>(
        '/projects/boards',
        {},
        { enabled: true, ttl: 600000 } // 10 min cache
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

export function createGetProjectBoardTool(client: PipedriveClient) {
  return {
    name: 'projects_boards_get',
    description: 'Get details of a specific project board by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Board ID' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = GetProjectBoardArgsSchema.parse(args);

      const response = await client.get<SingleResponse<ProjectBoard>>(
        `/projects/boards/${parsed.id}`,
        {},
        { enabled: true, ttl: 600000 } // 10 min cache
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
