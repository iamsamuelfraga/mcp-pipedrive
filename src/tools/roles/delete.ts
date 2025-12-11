import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeleteRoleSchema } from '../../schemas/role.js';

export function getDeleteRoleTool(client: PipedriveClient) {
  return {
    'roles/delete': {
      description: `Delete a role.

Removes a role from the company. Requires admin permissions.

Workflow tips:
- Cannot delete role with active assignments
- Use roles/get_role_assignments to check assignments first
- Remove all assignments before deletion
- Sub-roles may need to be reassigned

Common use cases:
- Delete unused role: { "id": 123 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the role to delete' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = DeleteRoleSchema.parse(args);
        return client.delete(`/roles/${id}`);
      },
    },
  };
}
