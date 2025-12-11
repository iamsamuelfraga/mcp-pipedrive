import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeleteProductSchema } from '../../schemas/product.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for deleting a product
 */
export function getDeleteProductTool(client: PipedriveClient) {
  return {
    name: 'products/delete',
    description: `Delete a product from Pipedrive.

The product will be marked as deleted and after 30 days will be permanently deleted.

Note: Deleting a product does not automatically remove it from existing deals.
Deals that already have this product attached will keep the product information.

This is useful for:
- Discontinuing products
- Cleaning up old inventory
- Removing test products`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Product ID to delete',
        },
      },
      required: ['id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = DeleteProductSchema.parse(params);

      const response = await client.delete<PipedriveResponse<{ id: number }>>(
        `/products/${validated.id}`
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
