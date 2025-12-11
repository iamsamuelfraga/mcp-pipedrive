import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListUsersSchema } from '../../schemas/user.js';

export function getListUsersTool(client: PipedriveClient) {
  return {
    'users/list': {
      description: `List all users within the company.

Returns all users in the Pipedrive company account with their details including roles, permissions, and settings.

Workflow tips:
- Returns all users in a single request (no pagination needed)
- Includes active and inactive users
- Shows user roles, permissions, and access levels
- Cached for 10 minutes for better performance

Common use cases:
- Get all company users: {}
- View user roles and permissions
- Check user active status`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
      },
      handler: async (args: unknown) => {
        ListUsersSchema.parse(args);
        return client.get('/users', undefined, { enabled: true, ttl: 600000 });
      },
    },
  };
}
