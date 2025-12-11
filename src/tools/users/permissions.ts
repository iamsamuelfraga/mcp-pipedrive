import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetUserPermissionsSchema } from '../../schemas/user.js';

export function getUserPermissionsTool(client: PipedriveClient) {
  return {
    'users_get_permissions': {
      description: `Get user permissions.

Returns all permissions assigned to the specified user including access levels and restrictions.

Workflow tips:
- Shows detailed permission breakdown
- Includes app-specific permissions
- Useful for auditing user access
- Cached for 10 minutes

Common use cases:
- Get user permissions: { "id": 123 }
- Audit user access levels
- Verify permissions before operations`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the user' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = GetUserPermissionsSchema.parse(args);
        return client.get(`/users/${id}/permissions`, undefined, { enabled: true, ttl: 600000 });
      },
    },
  };
}
