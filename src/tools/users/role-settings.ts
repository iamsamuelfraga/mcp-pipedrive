import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListUserRoleSettingsSchema } from '../../schemas/user.js';

export function getUserRoleSettingsTool(client: PipedriveClient) {
  return {
    'users/list_role_settings': {
      description: `List user role settings.

Returns all role-based settings for the specified user.

Workflow tips:
- Shows role-specific configurations
- Includes inherited settings from role hierarchy
- Useful for understanding user capabilities
- Cached for 10 minutes

Common use cases:
- Get role settings: { "id": 123 }
- Review user's role configuration
- Check visibility and access settings`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the user' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = ListUserRoleSettingsSchema.parse(args);
        return client.get(`/users/${id}/roleSettings`, undefined, { enabled: true, ttl: 600000 });
      },
    },
  };
}
