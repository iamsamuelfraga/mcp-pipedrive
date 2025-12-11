import type { PipedriveClient } from '../../pipedrive-client.js';
import { AddRoleSchema } from '../../schemas/role.js';

export function getCreateRoleTool(client: PipedriveClient) {
  return {
    'roles_create': {
      description: `Add a new role to the company.

Creates a new role with optional parent role for hierarchy. Requires admin permissions.

Workflow tips:
- Name is required and should be unique
- Parent role creates hierarchy
- New roles start with default permissions
- Use roles/add_role_setting to configure permissions

Common use cases:
- Create top-level role: { "name": "Sales Team" }
- Create sub-role: { "name": "Junior Sales", "parent_role_id": 123 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: {
            type: 'string',
            description: 'Name of the role',
          },
          parent_role_id: {
            type: 'number',
            description: 'ID of the parent role (optional, for hierarchy)',
          },
        },
        required: ['name'],
      },
      handler: async (args: unknown) => {
        const validated = AddRoleSchema.parse(args);
        return client.post('/roles', validated);
      },
    },
  };
}
