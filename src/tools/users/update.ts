import type { PipedriveClient } from '../../pipedrive-client.js';
import { UpdateUserSchema } from '../../schemas/user.js';

export function getUpdateUserTool(client: PipedriveClient) {
  return {
    'users_update': {
      description: `Update user details.

Updates information for an existing user. Requires admin permissions.

Workflow tips:
- Only provided fields will be updated
- Use users/get to retrieve current values first
- Email must remain unique if changed
- Cannot update own admin status

Common use cases:
- Update user name: { "id": 123, "name": "John Smith" }
- Change user email: { "id": 123, "email": "newemail@company.com" }
- Deactivate user: { "id": 123, "active_flag": false }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'number',
            description: 'ID of the user to update',
          },
          name: {
            type: 'string',
            description: 'Name of the user',
          },
          email: {
            type: 'string',
            description: 'Email address of the user',
          },
          active_flag: {
            type: 'boolean',
            description: 'Whether the user is active',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, ...updateData } = UpdateUserSchema.parse(args);
        return client.put(`/users/${id}`, updateData);
      },
    },
  };
}
