import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListDealMailMessagesSchema } from '../../schemas/deal.js';

export function getMailTools(client: PipedriveClient) {
  return {
    'deals_list_mail_messages': {
      description: `List mail messages associated with a deal.

Returns all email messages linked to a specific deal, including sent and received emails.

Workflow tips:
- View email communication history for a deal
- Includes both sent and received messages
- Use pagination for deals with many emails
- Emails are sorted by date (newest first)
- Cached for 5 minutes
- Useful for tracking client communication

Common use cases:
- List all emails: { "id": 123 }
- Paginated results: { "id": 123, "start": 0, "limit": 50 }
- Review email thread for a deal
- Track communication history with client`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal' },
          start: { type: 'number', description: 'Pagination start', default: 0 },
          limit: { type: 'number', description: 'Number of items to return per page' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, ...params } = ListDealMailMessagesSchema.parse(args);
        return client.get(`/deals/${id}/mailMessages`, params, { enabled: true, ttl: 300000 });
      },
    },
  };
}
