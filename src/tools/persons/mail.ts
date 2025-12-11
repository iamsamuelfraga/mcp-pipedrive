import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetPersonMailMessagesSchema } from '../../schemas/person.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for listing mail messages associated with a person
 */
export function getListPersonMailMessagesTool(client: PipedriveClient) {
  return {
    name: 'persons/list_mail_messages',
    description: `List mail messages associated with a person.

Returns all email messages linked to this person, including:
- Emails sent to the person
- Emails received from the person
- Email threads and conversations
- Message subjects and snippets
- Send/receive timestamps
- Associated deals or organizations

This is useful for:
- Reviewing email communication history
- Understanding customer interactions
- Preparing for meetings or calls
- Tracking email engagement
- CRM integration and context

Supports pagination for handling large email histories.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Person ID',
        },
        start: {
          type: 'number',
          description: 'Pagination start (default: 0)',
        },
        limit: {
          type: 'number',
          description: 'Number of items to return (max 500)',
        },
      },
      required: ['id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = GetPersonMailMessagesSchema.parse(params);

      const queryParams: Record<string, string | number | boolean> = {
        start: validated.start ?? 0,
      };

      if (validated.limit) queryParams.limit = validated.limit;

      const response = await client.get<PipedriveResponse<unknown[]>>(
        `/persons/${validated.id}/mailMessages`,
        queryParams,
        { enabled: true, ttl: 60000 } // Cache for 1 minute
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
