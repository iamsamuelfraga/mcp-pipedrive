import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetProductDealsSchema } from '../../schemas/product.js';
import type { Deal } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for listing deals attached to a product
 */
export function getListProductDealsTool(client: PipedriveClient) {
  return {
    name: 'products_list_deals',
    description: `Get all deals where a specific product is attached.

Returns a list of deals that have this product in their products list.
This is useful for:
- Tracking product usage across deals
- Analyzing product performance
- Finding deals with specific products
- Revenue forecasting by product

Filter options:
- status: Filter by deal status (open, won, lost, deleted, all_not_deleted)

Each deal includes full deal information plus product attachment details.`,
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
        status: {
          type: 'string',
          description: 'Filter by deal status',
          enum: ['open', 'won', 'lost', 'deleted', 'all_not_deleted'],
        },
      },
      required: ['id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = GetProductDealsSchema.parse(params);

      const queryParams: Record<string, string | number | boolean> = {
        start: validated.start || 0,
      };

      if (validated.limit) queryParams.limit = validated.limit;
      if (validated.status) queryParams.status = validated.status;

      const response = await client.get<PipedriveResponse<Deal[]>>(
        `/products/${validated.id}/deals`,
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
