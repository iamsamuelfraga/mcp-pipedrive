import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListRolesSchema } from '../../schemas/role.js';

export function getListRolesTool(client: PipedriveClient) {
  return {
    'roles/list': {
      description: `List all roles within the company.

Returns all roles with pagination support, including role hierarchy and assignment counts.

Workflow tips:
- Shows role hierarchy with parent_role_id
- Includes assignment and sub-role counts
- Use pagination for companies with many roles
- Cached for 15 minutes for better performance

Common use cases:
- List all roles: {}
- Paginated list: { "start": 0, "limit": 50 }
- View role hierarchy and structure`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          start: { type: 'number', description: 'Pagination start (default: 0)' },
          limit: { type: 'number', description: 'Number of items to return (default: 100, max: 500)' },
        },
      },
      handler: async (args: unknown) => {
        const validated = ListRolesSchema.parse(args);
        const { start, limit } = validated;

        return client.get(
          '/roles',
          {
            start: start ?? 0,
            limit: limit ?? 100,
          },
          { enabled: true, ttl: 900000 } // Cache for 15 minutes
        );
      },
    },
  };
}
