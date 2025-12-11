import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetCallLogSchema } from '../../schemas/call-log.js';

export function getGetCallLogTool(client: PipedriveClient) {
  return {
    'call_logs/get': {
      description: `Get details of a specific call log by ID.

Retrieves complete information about a single call log including phone numbers, duration, outcome, and linked records.

Workflow tips:
- Use call_logs/list to find call log IDs first
- Response includes all call details and associations
- Shows if there is a recording attached (has_recording)
- Cached for 5 minutes for better performance

Common use cases:
- Get call details: { "id": "CAd92b224eb4a39b5ad8fea92ff0e" }
- Check call outcome and duration
- Review call notes and associations`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'string',
            description: 'ID of the call log to retrieve'
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = GetCallLogSchema.parse(args);
        return client.get(`/callLogs/${id}`, undefined, { enabled: true, ttl: 300000 });
      },
    },
  };
}
