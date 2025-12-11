import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeleteLeadSchema } from '../../schemas/lead.js';

export function getDeleteLeadTool(client: PipedriveClient) {
  return {
    'leads/delete': {
      description: `Delete a specific lead from Pipedrive.

Permanently deletes a lead by its UUID. This action cannot be undone.

Workflow tips:
- Lead ID must be a UUID
- This permanently deletes the lead
- Consider archiving instead (use leads/update with is_archived: true)
- Returns the deleted lead's ID on success

Common use cases:
- Delete a lead: { "id": "adf21080-0e10-11eb-879b-05d71fb426ec" }

Alternative:
- Archive instead of delete: Use leads/update with { "id": "<uuid>", "is_archived": true }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'string',
            description: 'UUID of the lead to delete',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = DeleteLeadSchema.parse(args);
        return client.delete(`/leads/${validated.id}`);
      },
    },
  };
}
