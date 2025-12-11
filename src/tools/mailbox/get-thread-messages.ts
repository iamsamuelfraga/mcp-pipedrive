import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';
import type { MailMessage } from '../../types/pipedrive-api.js';

const GetMailThreadMessagesArgsSchema = z.object({
  id: z.number().describe('ID of the mail thread'),
});

export function createGetMailThreadMessagesTool(client: PipedriveClient) {
  return {
    name: 'mailbox/get-thread-messages',
    description: 'Get all mail messages inside a specific mail thread.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ID of the mail thread' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = GetMailThreadMessagesArgsSchema.parse(args);

      const response = await client.get<PipedriveResponse<MailMessage[]>>(
        `/mailbox/mailThreads/${parsed.id}/mailMessages`,
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
