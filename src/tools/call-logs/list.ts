import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListCallLogsSchema } from '../../schemas/call-log.js';

export function getListCallLogsTool(client: PipedriveClient) {
  return {
    'call_logs/list': {
      description: `Get all call logs assigned to the current user.

Retrieves call logs with pagination support. Returns logs for phone calls including duration, outcome, and associated records.

Workflow tips:
- Returns call logs for the authenticated user
- Use start and limit for pagination
- Each call log includes phone numbers, duration, outcome, and timestamps
- Can be linked to persons, organizations, deals, and leads
- Cached for 1 minute for better performance

Common use cases:
- List recent calls: { "start": 0, "limit": 50 }
- Paginate through calls: { "start": 50, "limit": 50 }
- Get all call history: Iterate through pages`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          start: {
            type: 'number',
            description: 'Pagination start',
            default: 0
          },
          limit: {
            type: 'number',
            description: 'Number of items to return (max 50)'
          },
        },
      },
      handler: async (args: unknown) => {
        const params = ListCallLogsSchema.parse(args);
        return client.get('/callLogs', params, { enabled: true, ttl: 60000 });
      },
    },
  };
}
