import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListPermissionSetsSchema } from '../../schemas/permission-set.js';

export function getListPermissionSetsTool(client: PipedriveClient) {
  return {
    'permission-sets/list': {
      description: `List all permission sets within the company.

Returns all permission sets with their configurations, including admin and regular user sets across different apps.

Workflow tips:
- Permission sets define user access and capabilities
- Apps include: sales, global, account_settings
- Each set has a type (admin, regular, custom)
- Shows assignment counts for each set
- Cached for 15 minutes (permission sets rarely change)

Common use cases:
- List all permission sets: {}
- Filter by app: { "app": "sales" }
- View global permissions: { "app": "global" }
- Check account settings access: { "app": "account_settings" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          app: { type: 'string', description: 'The app to filter the permission sets by (e.g., sales, global, account_settings)' },
        },
      },
      handler: async (args: unknown) => {
        const validated = ListPermissionSetsSchema.parse(args);
        const { app } = validated;

        return client.get(
          '/permissionSets',
          app ? { app } : undefined,
          { enabled: true, ttl: 900000 } // Cache for 15 minutes
        );
      },
    },
  };
}
