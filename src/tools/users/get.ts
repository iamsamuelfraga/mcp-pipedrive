import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetUserSchema } from '../../schemas/user.js';

export function getGetUserTool(client: PipedriveClient) {
  return {
    'users_get': {
      description: `Get detailed information about a specific user by ID.

Retrieves complete information about a single user including roles, permissions, timezone, and access settings.

Workflow tips:
- Use users/list to find user IDs first
- Response includes role assignments and permissions
- Cached for 10 minutes for better performance

Common use cases:
- Get user details: { "id": 123 }
- Check user permissions and role
- Verify user active status`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the user to retrieve' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = GetUserSchema.parse(args);
        return client.get(`/users/${id}`, undefined, { enabled: true, ttl: 600000 });
      },
    },
  };
}
