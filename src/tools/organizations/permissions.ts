import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetOrganizationPermittedUsersSchema } from '../../schemas/organization.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for listing permitted users for an organization
 */
export function getListOrganizationPermittedUsersTool(client: PipedriveClient) {
  return {
    name: 'organizations_list_permitted_users',
    description: `List users permitted to access an organization.

Returns a list of all users who have permission to view and/or edit this organization record.
This is determined by:
- The organization's visibility settings
- User roles and permissions
- Team assignments
- Sharing rules

Each entry includes:
- User ID
- User name and email
- Access level (view/edit)
- Permission source

This is useful for:
- Security auditing
- Access management
- Understanding data visibility
- Compliance and governance
- Team coordination

Note: Results depend on the visibility settings of the organization (e.g., owner only,
owner's team, everyone, etc.).`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Organization ID',
        },
      },
      required: ['id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = GetOrganizationPermittedUsersSchema.parse(params);

      const response = await client.get<PipedriveResponse<unknown[]>>(
        `/organizations/${validated.id}/permittedUsers`,
        undefined,
        { enabled: true, ttl: 300000 } // Cache for 5 minutes
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    },
  };
}
