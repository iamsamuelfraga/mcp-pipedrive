import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Project } from '../../types/pipedrive-api.js';

const ArchiveProjectArgsSchema = z.object({
  id: z.number().positive().describe('Project ID'),
});

interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export function createArchiveProjectTool(client: PipedriveClient) {
  return {
    name: 'projects_archive',
    description:
      'Archive a project. Archived projects can be retrieved by using the include_archived filter.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Project ID' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = ArchiveProjectArgsSchema.parse(args);

      const response = await client.post<SingleResponse<Project>>(
        `/projects/${parsed.id}/archive`,
        {}
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
