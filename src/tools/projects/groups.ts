import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { ProjectGroup } from '../../types/pipedrive-api.js';

const GetProjectGroupsArgsSchema = z.object({
  id: z.number().positive().describe('Project ID'),
});

interface ListResponse<T> {
  success: boolean;
  data: T[];
}

export function createGetProjectGroupsTool(client: PipedriveClient) {
  return {
    name: 'projects_groups_list',
    description:
      'Get all active groups under a specific project. Returns groups ordered by their order number.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Project ID' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = GetProjectGroupsArgsSchema.parse(args);

      const response = await client.get<ListResponse<ProjectGroup>>(
        `/projects/${parsed.id}/groups`,
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
