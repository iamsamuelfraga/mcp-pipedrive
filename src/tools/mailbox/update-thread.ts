import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';
import type { MailThread } from '../../types/pipedrive-api.js';

const UpdateMailThreadArgsSchema = z.object({
  id: z.number().describe('ID of the mail thread'),
  deal_id: z.number().optional().describe('ID of the deal this thread will be associated with'),
  lead_id: z.string().optional().describe('ID of the lead this thread will be associated with'),
  shared_flag: z.union([z.boolean(), z.number()]).optional().describe('Whether the mail thread is shared with other users'),
  read_flag: z.union([z.boolean(), z.number()]).optional().describe('Whether the mail thread is read'),
  archived_flag: z.union([z.boolean(), z.number()]).optional().describe('Whether the mail thread is archived'),
});

export function createUpdateMailThreadTool(client: PipedriveClient) {
  return {
    name: 'mailbox/update-thread',
    description: 'Update the properties of a mail thread.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ID of the mail thread' },
        deal_id: { type: 'number', description: 'ID of the deal this thread will be associated with' },
        lead_id: { type: 'string', description: 'ID of the lead this thread will be associated with' },
        shared_flag: { type: ['boolean', 'number'], description: 'Whether the mail thread is shared with other users' },
        read_flag: { type: ['boolean', 'number'], description: 'Whether the mail thread is read' },
        archived_flag: { type: ['boolean', 'number'], description: 'Whether the mail thread is archived' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = UpdateMailThreadArgsSchema.parse(args);
      const { id, ...updateData } = parsed;

      const response = await client.put<PipedriveResponse<MailThread>>(
        `/mailbox/mailThreads/${id}`,
        updateData
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
