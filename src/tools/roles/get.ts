import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetRoleSchema } from '../../schemas/role.js';

export function getGetRoleTool(client: PipedriveClient) {
  return {
    'roles/get': {
      description: `Get detailed information about a specific role by ID.

Retrieves complete information about a single role including hierarchy, assignments, and settings.

Workflow tips:
- Use roles/list to find role IDs first
- Response includes parent role and hierarchy level
- Shows assignment counts
- Cached for 15 minutes for better performance

Common use cases:
- Get role details: { "id": 123 }
- Check role hierarchy
- View role assignment count`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the role to retrieve' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = GetRoleSchema.parse(args);
        return client.get(`/roles/${id}`, undefined, { enabled: true, ttl: 900000 });
      },
    },
  };
}
