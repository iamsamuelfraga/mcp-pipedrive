import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetPermissionSetAssignmentsSchema } from '../../schemas/permission-set.js';

export function getPermissionSetAssignmentsTool(client: PipedriveClient) {
  return {
    'permission_sets_get_assignments': {
      description: `Get permission set assignments.

Returns all users assigned to a specific permission set with pagination support.

Workflow tips:
- Shows all users with this permission set
- Use pagination for permission sets with many users
- Useful for auditing permission set membership
- Helps understand who has access to what
- Cached for 15 minutes

Common use cases:
- Get assignments: { "id": "f07d229d-088a-4144-a40f-1fe64295d180" }
- Paginated list: { "id": "f07d229d-088a-4144-a40f-1fe64295d180", "start": 0, "limit": 50 }
- Audit user permissions and access levels`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'string', description: 'ID of the permission set (UUID)' },
          start: { type: 'number', description: 'Pagination start (default: 0)' },
          limit: { type: 'number', description: 'Number of items to return (default: 100)' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, start, limit } = GetPermissionSetAssignmentsSchema.parse(args);
        return client.get(
          `/permissionSets/${id}/assignments`,
          {
            start: start ?? 0,
            limit: limit ?? 100,
          },
          { enabled: true, ttl: 900000 }
        );
      },
    },
  };
}
