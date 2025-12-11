import type { PipedriveClient } from '../../pipedrive-client.js';
import {
  AddProductFollowerSchema,
  GetProductFollowersSchema,
  RemoveProductFollowerSchema,
} from '../../schemas/product.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for listing followers of a product
 */
export function getListProductFollowersTool(client: PipedriveClient) {
  return {
    name: 'products_list_followers',
    description: `List all followers of a specific product.

Returns a list of users who are following this product and will receive
notifications about updates.

Each follower entry includes:
- User ID
- Follower ID (relationship ID)
- Product ID
- When they started following

This is useful for:
- Checking who is tracking a product
- Auditing team access
- Managing notifications`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Product ID',
        },
        start: {
          type: 'number',
          description: 'Pagination start (default: 0)',
        },
        limit: {
          type: 'number',
          description: 'Items per page, max 500',
        },
      },
      required: ['id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = GetProductFollowersSchema.parse(params);

      const queryParams: Record<string, number> = {
        start: validated.start || 0,
      };

      if (validated.limit) queryParams.limit = validated.limit;

      const response = await client.get<PipedriveResponse<unknown[]>>(
        `/products/${validated.id}/followers`,
        queryParams,
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

/**
 * Tool for adding a follower to a product
 */
export function getAddProductFollowerTool(client: PipedriveClient) {
  return {
    name: 'products_add_follower',
    description: `Add a follower to a product.

Followers are users who will receive notifications about updates to this product.
This is useful for team collaboration and keeping stakeholders informed.

When a user follows a product, they will be notified about:
- Changes to product details
- Product being added to deals
- Price changes
- Other updates

Note: Users can only be added as followers if they have access to the product.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Product ID',
        },
        user_id: {
          type: 'number',
          description: 'User ID to add as follower',
        },
      },
      required: ['id', 'user_id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = AddProductFollowerSchema.parse(params);

      const response = await client.post<
        PipedriveResponse<{ user_id: number; id: number; product_id: number }>
      >(`/products/${validated.id}/followers`, { user_id: validated.user_id });

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
 * Tool for removing a follower from a product
 */
export function getDeleteProductFollowerTool(client: PipedriveClient) {
  return {
    name: 'products_delete_follower',
    description: `Remove a follower from a product.

Stops a user from receiving notifications about this product.

Note: You need the follower_id (the relationship ID), not the user_id.
Get this from the products/list_followers endpoint.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Product ID',
        },
        follower_id: {
          type: 'number',
          description: 'Follower relationship ID (not user_id)',
        },
      },
      required: ['id', 'follower_id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = RemoveProductFollowerSchema.parse(params);

      const response = await client.delete<PipedriveResponse<{ id: number }>>(
        `/products/${validated.id}/followers/${validated.follower_id}`
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
