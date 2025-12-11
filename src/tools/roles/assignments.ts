import type { PipedriveClient } from '../../pipedrive-client.js';
import {
  GetRoleAssignmentsSchema,
  AddRoleAssignmentSchema,
  DeleteRoleAssignmentSchema,
} from '../../schemas/role.js';

export function getRoleAssignmentTools(client: PipedriveClient) {
  return {
    'roles_get_role_assignments': {
      description: `Get role assignments.

Returns all users assigned to a specific role with pagination support.

Workflow tips:
- Shows all users with this role
- Use pagination for roles with many users
- Useful for auditing role membership
- Cached for 15 minutes

Common use cases:
- Get role assignments: { "id": 123 }
- Paginated list: { "id": 123, "start": 0, "limit": 50 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the role' },
          start: { type: 'number', description: 'Pagination start (default: 0)' },
          limit: { type: 'number', description: 'Number of items to return (default: 100)' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, start, limit } = GetRoleAssignmentsSchema.parse(args);
        return client.get(
          `/roles/${id}/assignments`,
          {
            start: start ?? 0,
            limit: limit ?? 100,
          },
          { enabled: true, ttl: 900000 }
        );
      },
    },

    'roles_add_role_assignment': {
      description: `Add a role assignment.

Assigns a role to a user. Requires admin permissions.

Workflow tips:
- User can have only one role at a time
- Previous role assignment will be replaced
- User inherits all role permissions
- Changes take effect immediately

Common use cases:
- Assign role to user: { "id": 123, "user_id": 456 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the role' },
          user_id: { type: 'number', description: 'ID of the user to assign the role to' },
        },
        required: ['id', 'user_id'],
      },
      handler: async (args: unknown) => {
        const { id, user_id } = AddRoleAssignmentSchema.parse(args);
        return client.post(`/roles/${id}/assignments`, { user_id });
      },
    },

    'roles_delete_role_assignment': {
      description: `Delete a role assignment.

Removes a role from a user. Requires admin permissions.

Workflow tips:
- User will lose role permissions
- User should be assigned to another role
- Use roles/get_role_assignments to verify removal

Common use cases:
- Remove role from user: { "id": 123, "user_id": 456 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the role' },
          user_id: { type: 'number', description: 'ID of the user to remove the role from' },
        },
        required: ['id', 'user_id'],
      },
      handler: async (args: unknown) => {
        const { id, user_id } = DeleteRoleAssignmentSchema.parse(args);
        return client.delete(`/roles/${id}/assignments`, { user_id });
      },
    },
  };
}
