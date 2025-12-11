import type { PipedriveClient } from '../../pipedrive-client.js';
import { RemovePersonFollowerSchema } from '../../schemas/person.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for removing a follower from a person
 */
export function getDeletePersonFollowerTool(client: PipedriveClient) {
  return {
    name: 'persons/delete_follower',
    description: `Delete a follower from a person.

Removes a user from the list of followers for this person. After removal:
- The user will no longer receive notifications about person updates
- They will still have access to the person if permissions allow
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
          description: 'Person ID',
        },
        follower_id: {
          type: 'number',
          description: 'User ID of the follower to remove',
        },
      },
      required: ['id', 'follower_id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = RemovePersonFollowerSchema.parse(params);

      const response = await client.delete<PipedriveResponse<{ id: number }>>(
        `/persons/${validated.id}/followers/${validated.follower_id}`
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
