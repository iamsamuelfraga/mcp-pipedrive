import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetPermissionSetSchema } from '../../schemas/permission-set.js';

export function getGetPermissionSetTool(client: PipedriveClient) {
  return {
    'permission-sets/get': {
      description: `Get detailed information about a specific permission set by ID.

Retrieves complete information about a single permission set including its contents (individual permissions).

Workflow tips:
- Use permission-sets/list to find permission set IDs first
- Response includes detailed permission contents
- Shows which specific capabilities are granted
- Cached for 15 minutes for better performance

Common use cases:
- Get permission set details: { "id": "f07d229d-088a-4144-a40f-1fe64295d180" }
- View permission contents and capabilities
- Check what actions a permission set allows`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'string', description: 'ID of the permission set (UUID)' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = GetPermissionSetSchema.parse(args);
        return client.get(`/permissionSets/${id}`, undefined, { enabled: true, ttl: 900000 });
      },
    },
  };
}
