import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';
import type { MailThread } from '../../types/pipedrive-api.js';

const GetMailThreadsArgsSchema = z.object({
  folder: z.enum(['inbox', 'drafts', 'sent', 'archive']).describe('The type of folder to fetch'),
  start: z.number().optional().describe('Pagination start'),
  limit: z.number().optional().describe('Items shown per page'),
});

export function createGetMailThreadsTool(client: PipedriveClient) {
  return {
    name: 'mailbox/get-threads',
    description: 'Get mail threads in a specified folder ordered by the most recent message within.',
    inputSchema: {
      type: 'object',
      properties: {
        folder: {
          type: 'string',
          enum: ['inbox', 'drafts', 'sent', 'archive'],
          description: 'The type of folder to fetch',
        },
        start: { type: 'number', description: 'Pagination start' },
        limit: { type: 'number', description: 'Items shown per page' },
      },
      required: ['folder'],
    },
    handler: async (args: unknown) => {
      const parsed = GetMailThreadsArgsSchema.parse(args);

      const params: Record<string, string | number> = {
        folder: parsed.folder,
      };
      if (parsed.start !== undefined) {
        params.start = parsed.start;
      }
      if (parsed.limit !== undefined) {
        params.limit = parsed.limit;
      }

      const response = await client.get<PipedriveResponse<MailThread[]>>(
        '/mailbox/mailThreads',
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
