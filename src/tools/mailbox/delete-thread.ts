import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';

const DeleteMailThreadArgsSchema = z.object({
  id: z.number().describe('ID of the mail thread to delete'),
});

export function createDeleteMailThreadTool(client: PipedriveClient) {
  return {
    name: 'mailbox_delete_thread',
    description: 'Mark a mail thread as deleted.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ID of the mail thread to delete' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = DeleteMailThreadArgsSchema.parse(args);

      const response = await client.delete<PipedriveResponse<{ id: number }>>(
        `/mailbox/mailThreads/${parsed.id}`
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
