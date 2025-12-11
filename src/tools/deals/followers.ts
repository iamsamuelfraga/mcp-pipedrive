import type { PipedriveClient } from '../../pipedrive-client.js';
import {
  AddDealFollowerSchema,
  RemoveDealFollowerSchema,
  GetDealFollowersSchema,
} from '../../schemas/deal.js';

export function getFollowerTools(client: PipedriveClient) {
  return {
    'deals/add_follower': {
      description: `Add a follower to a deal.

Followers receive notifications about deal updates and can track the deal's progress.

Workflow tips:
- Use users/list to get user IDs
- User must exist in the Pipedrive account
- Follower receives notifications for deal changes
- Cannot add same follower twice

Common use cases:
- Add team member: { "id": 123, "user_id": 456 }
- Add manager for oversight: { "id": 789, "user_id": 10 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal' },
          user_id: { type: 'number', description: 'ID of the user to add as a follower' },
        },
        required: ['id', 'user_id'],
      },
      handler: async (args: unknown) => {
        const { id, user_id } = AddDealFollowerSchema.parse(args);
        return client.post(`/deals/${id}/followers`, { user_id });
      },
    },

    'deals/remove_follower': {
      description: `Remove a follower from a deal.

Stops a user from receiving notifications about this deal.

Workflow tips:
- Use deals/list_followers to get follower IDs first
- Follower ID is different from user ID
- Cannot remove the deal owner

Common use cases:
- Remove follower: { "id": 123, "follower_id": 456 }
- Workflow: list followers, then remove specific one`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal' },
          follower_id: { type: 'number', description: 'ID of the follower to remove' },
        },
        required: ['id', 'follower_id'],
      },
      handler: async (args: unknown) => {
        const { id, follower_id } = RemoveDealFollowerSchema.parse(args);
        return client.delete(`/deals/${id}/followers/${follower_id}`);
      },
    },

    'deals/list_followers': {
      description: `List all followers of a deal.

Returns list of users following this deal and receiving notifications about it.

Workflow tips:
- Shows user details for each follower
- Includes follower ID needed for removal
- Deal owner is automatically a follower
- Cached for 5 minutes

Common use cases:
- View followers: { "id": 123 }
- Before removing: list to get follower_id`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = GetDealFollowersSchema.parse(args);
        return client.get(`/deals/${id}/followers`, undefined, { enabled: true, ttl: 300000 });
      },
    },
  };
}
