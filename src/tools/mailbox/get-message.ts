import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';
import type { MailMessage } from '../../types/pipedrive-api.js';

const GetMailMessageArgsSchema = z.object({
  id: z.number().describe('ID of the mail message'),
  include_body: z
    .union([z.boolean(), z.number()])
    .optional()
    .describe('Whether to include the full message body or not'),
});

export function createGetMailMessageTool(client: PipedriveClient) {
  return {
    name: 'mailbox_get_message',
    description: 'Get details of a specific mail message by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ID of the mail message' },
        include_body: {
          type: ['boolean', 'number'],
          description: 'Whether to include the full message body or not',
        },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = GetMailMessageArgsSchema.parse(args);

      const params: Record<string, boolean | number> = {};
      if (parsed.include_body !== undefined) {
        params.include_body = parsed.include_body;
      }

      const response = await client.get<PipedriveResponse<MailMessage>>(
        `/mailbox/mailMessages/${parsed.id}`,
        params,
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
