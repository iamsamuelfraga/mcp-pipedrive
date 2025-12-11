import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListUserRoleAssignmentsSchema } from '../../schemas/user.js';

export function getUserRoleAssignmentsTool(client: PipedriveClient) {
  return {
    'users_list_role_assignments': {
      description: `List role assignments for a user.

Returns all role assignments for a specific user with pagination support.

Workflow tips:
- Shows all roles assigned to the user
- Includes role hierarchy information
- Use pagination for users with many role assignments
- Cached for 10 minutes
- Useful for auditing user permissions

Common use cases:
- List all role assignments: { "id": 123 }
- Paginated list: { "id": 123, "start": 0, "limit": 50 }
- Check user's current roles`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the user' },
          start: { type: 'number', description: 'Pagination start (default: 0)' },
          limit: { type: 'number', description: 'Number of items to return (max: 500)' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, start, limit } = ListUserRoleAssignmentsSchema.parse(args);
        const params: { start?: number; limit?: number } = {};

        if (start !== undefined) {
          params.start = start;
        }
        if (limit !== undefined) {
          params.limit = limit;
        }

        return client.get(
          `/users/${id}/roleAssignments`,
          Object.keys(params).length > 0 ? params : undefined,
          { enabled: true, ttl: 600000 }
        );
      },
    },
  };
}
