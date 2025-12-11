import type { PipedriveClient } from '../../pipedrive-client.js';
import {
  ListUserFollowersSchema,
  AddUserFollowerSchema,
  DeleteUserFollowerSchema,
} from '../../schemas/user.js';

export function getUserFollowerTools(client: PipedriveClient) {
  return {
    'users_list_followers': {
      description: `List followers of a user.

Returns all users who are following the specified user.

Workflow tips:
- Shows users tracking this user's activities
- Useful for managing team visibility
- Cached for 10 minutes

Common use cases:
- Get user followers: { "id": 123 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the user' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = ListUserFollowersSchema.parse(args);
        return client.get(`/users/${id}/followers`, undefined, { enabled: true, ttl: 600000 });
      },
    },

    'users_add_follower': {
      description: `Add a follower to a user.

Makes one user follow another user's activities.

Workflow tips:
- Follower will see activities of followed user
- Useful for team collaboration and visibility
- Requires appropriate permissions

Common use cases:
- Add follower: { "id": 123, "user_id": 456 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the user to be followed' },
          user_id: { type: 'number', description: 'ID of the user to add as follower' },
        },
        required: ['id', 'user_id'],
      },
      handler: async (args: unknown) => {
        const { id, user_id } = AddUserFollowerSchema.parse(args);
        return client.post(`/users/${id}/followers`, { user_id });
      },
    },

    'users_delete_follower': {
      description: `Remove a follower from a user.

Removes the follower relationship between two users.

Workflow tips:
- Follower will stop seeing followed user's activities
- Use users/list_followers to get follower IDs

Common use cases:
- Remove follower: { "id": 123, "follower_id": 456 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the user being followed' },
          follower_id: { type: 'number', description: 'ID of the follower to remove' },
        },
        required: ['id', 'follower_id'],
      },
      handler: async (args: unknown) => {
        const { id, follower_id } = DeleteUserFollowerSchema.parse(args);
        return client.delete(`/users/${id}/followers/${follower_id}`);
      },
    },
  };
}
