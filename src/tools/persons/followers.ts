import type { PipedriveClient } from '../../pipedrive-client.js';
import { AddPersonFollowerSchema, GetPersonFollowersSchema } from '../../schemas/person.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for adding a follower to a person
 */
export function getAddPersonFollowerTool(client: PipedriveClient) {
  return {
    name: 'persons/add_follower',
    description: `Add a follower to a person.

Followers are users who will receive notifications about updates to this person.
This is useful for team collaboration and keeping stakeholders informed.

When a user follows a person, they will be notified about:
- Changes to person details
- New activities
- New deals
- New notes
- Other updates

Note: Users can only be added as followers if they have access to the person.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Person ID',
        },
        user_id: {
          type: 'number',
          description: 'User ID to add as follower',
        },
      },
      required: ['id', 'user_id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = AddPersonFollowerSchema.parse(params);

      const response = await client.post<PipedriveResponse<{ user_id: number }>>(
        `/persons/${validated.id}/followers`,
        { user_id: validated.user_id }
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

/**
 * Tool for listing followers of a person
 */
export function getListPersonFollowersTool(client: PipedriveClient) {
  return {
    name: 'persons/list_followers',
    description: `List all followers of a specific person.

Returns a list of users who are following this person and will receive
notifications about updates.

Each follower entry includes:
- User ID
- User name
- User email
- When they started following

This is useful for:
- Checking who is tracking a person
- Auditing team access
- Managing notifications`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Person ID',
        },
      },
      required: ['id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = GetPersonFollowersSchema.parse(params);

      const response = await client.get<PipedriveResponse<unknown[]>>(
        `/persons/${validated.id}/followers`,
        undefined,
        { enabled: true, ttl: 60000 } // Cache for 1 minute
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
