import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Activity } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';

const MarkActivityAsDoneArgsSchema = z.object({
  id: z.number().describe('Activity ID'),
});

export function createMarkActivityAsDoneTool(client: PipedriveClient) {
  return {
    name: 'activities_mark_as_done',
    description:
      'Mark an activity as done. This is a convenience tool that updates the activity with done: true.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Activity ID' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = MarkActivityAsDoneArgsSchema.parse(args);

      const response = await client.put<PipedriveResponse<Activity>>(`/activities/${parsed.id}`, {
        done: true,
      });

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
