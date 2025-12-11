import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetProductSchema } from '../../schemas/product.js';
import type { Product } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for getting a single product
 */
export function getGetProductTool(client: PipedriveClient) {
  return {
    name: 'products_get',
    description: `Get detailed information about a specific product.

Returns complete product data including:
- Basic information (name, code, description, unit)
- Pricing information (prices array with different currencies)
- Billing information (frequency, cycles)
- Metadata (owner, visibility, timestamps)
- Tax and category information

Use this when you need full details about a product, such as:
- Viewing complete product specifications
- Getting pricing information
- Checking product availability and status`,
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
      const validated = GetProductSchema.parse(params);

      const response = await client.get<PipedriveResponse<Product>>(
        `/products/${validated.id}`,
        undefined,
        { enabled: true, ttl: 600000 } // Cache for 10 minutes
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
