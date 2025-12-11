import type { PipedriveClient } from '../../pipedrive-client.js';
import { UpdateRoleSchema } from '../../schemas/role.js';

export function getUpdateRoleTool(client: PipedriveClient) {
  return {
    'roles_update': {
      description: `Update role details.

Updates information for an existing role. Requires admin permissions.

Workflow tips:
- Only provided fields will be updated
- Use roles/get to retrieve current values first
- Changing parent_role_id affects hierarchy
- Name should remain unique

Common use cases:
- Rename role: { "id": 123, "name": "Senior Sales Team" }
- Change hierarchy: { "id": 123, "parent_role_id": 456 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'number',
            description: 'ID of the role to update',
          },
          name: {
            type: 'string',
            description: 'Name of the role',
          },
          parent_role_id: {
            type: 'number',
            description: 'ID of the parent role',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, ...updateData } = UpdateRoleSchema.parse(args);
        return client.put(`/roles/${id}`, updateData);
      },
    },
  };
}
