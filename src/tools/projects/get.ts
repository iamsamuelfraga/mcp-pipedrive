import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Project } from '../../types/pipedrive-api.js';

const GetProjectArgsSchema = z.object({
  id: z.number().positive().describe('Project ID'),
});

interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export function createGetProjectTool(client: PipedriveClient) {
  return {
    name: 'projects/get',
    description:
      'Get details of a specific project by ID. Returns complete project information including custom fields.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Project ID' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = GetProjectArgsSchema.parse(args);

      const response = await client.get<SingleResponse<Project>>(
        `/projects/${parsed.id}`,
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
