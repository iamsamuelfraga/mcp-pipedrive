import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Activity } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';

const GetActivityArgsSchema = z.object({
  id: z.number().describe('Activity ID'),
});

export function createGetActivityTool(client: PipedriveClient) {
  return {
    name: 'activities/get',
    description: 'Get details of a specific activity by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Activity ID' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = GetActivityArgsSchema.parse(args);

      const response = await client.get<PipedriveResponse<Activity>>(
        `/activities/${parsed.id}`,
        {},
        { enabled: true, ttl: 30000 }
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
