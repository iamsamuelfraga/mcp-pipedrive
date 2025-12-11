import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';

const DeleteProjectArgsSchema = z.object({
  id: z.number().positive().describe('Project ID'),
});

interface DeleteResponse {
  success: boolean;
  data: {
    id: number;
  };
}

export function createDeleteProjectTool(client: PipedriveClient) {
  return {
    name: 'projects/delete',
    description:
      'Delete a project by marking it as deleted. This does not permanently remove the project.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Project ID' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = DeleteProjectArgsSchema.parse(args);

      const response = await client.delete<DeleteResponse>(`/projects/${parsed.id}`);

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
