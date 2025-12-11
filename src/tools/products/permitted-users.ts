import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetProductPermittedUsersSchema } from '../../schemas/product.js';
import type { PipedriveResponse } from '../../types/common.js';

export function getProductPermittedUsersTool(client: PipedriveClient) {
  return {
    name: 'products_list_permitted_users',
    description: `List all users who have access to view and edit a specific product.

Returns a list of users who have permission to access this product based on
visibility settings and team structure.

Workflow tips:
- Product visibility determines which users can access it
- Visibility can be: owner only, owner's team, entire company, or custom
- This is useful for understanding who can see and modify the product
- Access permissions affect whether users can add the product to deals

Common use cases:
- Audit product access permissions
- Verify team members can see a product
- Check visibility before sharing product with team
- Troubleshoot why a user cannot see a product

Example:
{ "id": 123 }`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Product ID',
        },
      },
      required: ['id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = GetProductPermittedUsersSchema.parse(params);

      const response = await client.get<PipedriveResponse<unknown[]>>(
        `/products/${validated.id}/permittedUsers`,
        {},
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
