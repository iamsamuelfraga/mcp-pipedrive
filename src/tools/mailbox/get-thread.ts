import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';
import type { MailThread } from '../../types/pipedrive-api.js';

const GetMailThreadArgsSchema = z.object({
  id: z.number().describe('ID of the mail thread'),
});

export function createGetMailThreadTool(client: PipedriveClient) {
  return {
    name: 'mailbox_get_thread',
    description: 'Get details of a specific mail thread by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ID of the mail thread' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = GetMailThreadArgsSchema.parse(args);

      const response = await client.get<PipedriveResponse<MailThread>>(
        `/mailbox/mailThreads/${parsed.id}`,
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
