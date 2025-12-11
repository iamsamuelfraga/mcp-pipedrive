import type { PipedriveClient } from '../../pipedrive-client.js';
import { RemoveOrganizationFollowerSchema } from '../../schemas/organization.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for removing a follower from an organization
 */
export function getDeleteOrganizationFollowerTool(client: PipedriveClient) {
  return {
    name: 'organizations_delete_follower',
    description: `Delete a follower from an organization.

Removes a user from the list of followers for this organization. After removal:
- The user will no longer receive notifications about organization updates
- They will still have access to the organization if permissions allow
- This only affects notification settings, not access rights

This is useful for:
- Managing notification preferences
- Adjusting team involvement
- Reducing notification noise
- Changing account ownership responsibilities

Note: The follower_id is the user ID of the follower to remove.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Organization ID',
        },
        follower_id: {
          type: 'number',
          description: 'User ID of the follower to remove',
        },
      },
      required: ['id', 'follower_id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = RemoveOrganizationFollowerSchema.parse(params);

      const response = await client.delete<PipedriveResponse<{ id: number }>>(
        `/organizations/${validated.id}/followers/${validated.follower_id}`
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
