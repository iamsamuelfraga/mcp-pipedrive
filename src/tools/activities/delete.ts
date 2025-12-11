import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';

const DeleteActivityArgsSchema = z.object({
  id: z.number().describe('Activity ID'),
});

export function createDeleteActivityTool(client: PipedriveClient) {
  return {
    name: 'activities/delete',
    description: 'Delete an activity by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Activity ID' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = DeleteActivityArgsSchema.parse(args);

      const response = await client.delete<PipedriveResponse<{ id: number }>>(
        `/activities/${parsed.id}`
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
