import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListDealPermittedUsersSchema } from '../../schemas/deal.js';

export function getPermissionTools(client: PipedriveClient) {
  return {
    'deals/list_permitted_users': {
      description: `List permitted users for a deal.

Returns the list of users who have access to view and edit a specific deal based on its visibility settings.

Workflow tips:
- Shows which users can access the deal
- Depends on deal's visibility settings (private, shared, etc.)
- Includes user details and permission levels
- Useful for access control auditing
- Cached for 5 minutes

Common use cases:
- Check deal access: { "id": 123 }
- Audit who can see a sensitive deal
- Verify team member access
- Review sharing permissions`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = ListDealPermittedUsersSchema.parse(args);
        return client.get(`/deals/${id}/permittedUsers`, undefined, { enabled: true, ttl: 300000 });
      },
    },
  };
}
