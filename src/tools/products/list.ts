import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListProductsSchema } from '../../schemas/product.js';
import type { Product } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for listing products with pagination
 */
export function getListProductsTool(client: PipedriveClient) {
  return {
    name: 'products_list',
    description: `List all products with optional filtering and pagination.

Supports filtering by:
- user_id: Filter by owner
- filter_id: Apply a saved filter
- ids: Array of specific product IDs to return
- first_char: Filter by first character of name (single letter)
- get_summary: Include total count in response

Returns paginated results. Use start/limit for manual pagination.`,
    inputSchema: {
      type: 'object',
      properties: {
        start: {
          type: 'number',
          description: 'Pagination start (default: 0)',
        },
        limit: {
          type: 'number',
          description: 'Items per page, max 500 (default: 100)',
        },
        user_id: {
          type: 'number',
          description: 'Filter by owner user ID',
        },
        filter_id: {
          type: 'number',
          description: 'Filter ID to apply',
        },
        ids: {
          type: 'array',
          description: 'Array of product IDs to return',
          items: {
            type: 'number',
          },
        },
        first_char: {
          type: 'string',
          description: 'Filter by first character of name (e.g., "A", "B")',
        },
        get_summary: {
          type: 'boolean',
          description: 'Include total count in response',
        },
      },
    } as const,
    handler: async (params: unknown) => {
      const validated = ListProductsSchema.parse(params);

      const queryParams: Record<string, string | number | boolean> = {
        start: validated.start,
      };

      if (validated.limit) queryParams.limit = validated.limit;
      if (validated.user_id) queryParams.user_id = validated.user_id;
      if (validated.filter_id) queryParams.filter_id = validated.filter_id;
      if (validated.ids) queryParams.ids = validated.ids.join(',');
      if (validated.first_char) queryParams.first_char = validated.first_char;
      if (validated.get_summary !== undefined)
        queryParams.get_summary = validated.get_summary ? 1 : 0;

      const response = await client.get<PipedriveResponse<Product[]>>(
        '/products',
        queryParams,
        { enabled: true, ttl: 300000 } // Cache for 5 minutes
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
 * Tool for auto-pagination to fetch all products
 */
export function getListAllProductsAutoTool(client: PipedriveClient) {
  return {
    name: 'products_list_all_auto',
    description: `Automatically fetch ALL products using pagination.

This tool handles pagination automatically and returns all products matching the filters.
Use this when you need the complete list without managing pagination manually.

Warning: This can return a large dataset if you have many products.

Supports the same filters as products/list:
- user_id: Filter by owner
- filter_id: Apply a saved filter
- first_char: Filter by first character of name`,
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'number',
          description: 'Filter by owner user ID',
        },
        filter_id: {
          type: 'number',
          description: 'Filter ID to apply',
        },
        first_char: {
          type: 'string',
          description: 'Filter by first character of name (e.g., "A", "B")',
        },
      },
    } as const,
    handler: async (params: unknown) => {
      const validated = z
        .object({
          user_id: z.number().int().positive().optional(),
          filter_id: z.number().int().positive().optional(),
          first_char: z.string().length(1).optional(),
        })
        .parse(params);

      const queryParams: Record<string, string | number | boolean> = {};

      if (validated.user_id) queryParams.user_id = validated.user_id;
      if (validated.filter_id) queryParams.filter_id = validated.filter_id;
      if (validated.first_char) queryParams.first_char = validated.first_char;

      const paginator = client.createPaginator<Product>('/products', queryParams);
      const allProducts = await paginator.fetchAll(100);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                data: allProducts,
                count: allProducts.length,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  };
}
