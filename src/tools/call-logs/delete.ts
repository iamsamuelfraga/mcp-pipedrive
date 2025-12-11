import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeleteCallLogSchema } from '../../schemas/call-log.js';

export function getDeleteCallLogTool(client: PipedriveClient) {
  return {
    'call_logs/delete': {
      description: `Delete a call log.

Permanently removes a call log from the system. If there is an audio recording attached, it will also be deleted.
Note: The related activity will NOT be removed by this operation.

Workflow tips:
- Use call_logs/list to find the call log ID first
- Deleting the call log also deletes any attached audio recording
- The associated activity (if any) remains in the system
- This action cannot be undone

Common use cases:
- Remove incorrect call log: { "id": "CAd92b224eb4a39b5ad8fea92ff0e" }
- Clean up old call logs: { "id": "CAd92b224eb4a39b5ad8fea92ff0e" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'string',
            description: 'ID of the call log to delete',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = DeleteCallLogSchema.parse(args);
        return client.delete(`/callLogs/${id}`);
      },
    },
  };
}
