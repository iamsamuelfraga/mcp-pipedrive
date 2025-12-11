import type { PipedriveClient } from '../../pipedrive-client.js';
import { AddUserSchema } from '../../schemas/user.js';

export function getCreateUserTool(client: PipedriveClient) {
  return {
    'users/create': {
      description: `Add a new user to the company.

Creates a new user account in the Pipedrive company. Requires admin permissions.

Workflow tips:
- Email is required and must be unique
- User will receive an activation email
- New users are active by default
- Name can be provided or will be derived from email

Common use cases:
- Add new team member: { "name": "John Doe", "email": "john@company.com" }
- Create inactive user: { "name": "Jane Smith", "email": "jane@company.com", "active_flag": false }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: {
            type: 'string',
            description: 'Name of the user',
          },
          email: {
            type: 'string',
            description: 'Email address of the user (must be unique)',
          },
          active_flag: {
            type: 'boolean',
            description: 'Whether the user is active (default: true)',
          },
        },
        required: ['name', 'email'],
      },
      handler: async (args: unknown) => {
        const validated = AddUserSchema.parse(args);
        return client.post('/users', validated);
      },
    },
  };
}
