import type { PipedriveClient } from '../../pipedrive-client.js';
import {
  AddDealProductSchema,
  UpdateDealProductSchema,
  RemoveDealProductSchema,
  GetDealProductsSchema,
} from '../../schemas/deal.js';

export function getProductTools(client: PipedriveClient) {
  return {
    'deals/add_product': {
      description: `Add a product to a deal.

Attaches a product to the deal with specific pricing, quantity, and discount.

Workflow tips:
- Use products/search or products/list to find product IDs
- Product must exist in Pipedrive catalog
- Specify item_price to override default product price
- Quantity defaults to 1 if not specified
- Discount is percentage (0-100)
- Duration is for subscription products

Common use cases:
- Add basic product: { "id": 123, "product_id": 456 }
- With custom price: { "id": 123, "product_id": 456, "item_price": 99.99, "quantity": 2 }
- With discount: { "id": 123, "product_id": 456, "quantity": 10, "discount_percentage": 15 }
- Subscription: { "id": 123, "product_id": 456, "duration": 12, "comments": "Annual subscription" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal' },
          product_id: { type: 'number', description: 'ID of the product to add' },
          item_price: { type: 'number', description: 'Price at which this product will be added' },
          quantity: { type: 'number', description: 'Quantity of items (default: 1)' },
          discount_percentage: { type: 'number', description: 'Discount percentage (0-100, default: 0)' },
          duration: { type: 'number', description: 'Duration for subscription products' },
          product_variation_id: { type: 'number', description: 'ID of the product variation' },
          comments: { type: 'string', description: 'Additional comments about the product' },
          enabled_flag: { type: 'boolean', description: 'Whether the product is enabled (default: true)' },
        },
        required: ['id', 'product_id'],
      },
      handler: async (args: unknown) => {
        const { id, ...productData } = AddDealProductSchema.parse(args);
        return client.post(`/deals/${id}/products`, productData);
      },
    },

    'deals/update_product': {
      description: `Update a product attached to a deal.

Modifies the price, quantity, discount, or other details of a product already attached to a deal.

Workflow tips:
- Use deals/list_products to get product_attachment_id
- product_attachment_id is NOT the same as product_id
- Only specify fields you want to update
- Cannot change the actual product, only its parameters

Common use cases:
- Update quantity: { "id": 123, "product_attachment_id": 789, "quantity": 5 }
- Change price: { "id": 123, "product_attachment_id": 789, "item_price": 149.99 }
- Add discount: { "id": 123, "product_attachment_id": 789, "discount_percentage": 20 }
- Update multiple: { "id": 123, "product_attachment_id": 789, "quantity": 3, "discount_percentage": 10, "comments": "Updated terms" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal' },
          product_attachment_id: { type: 'number', description: 'ID of the deal-product attachment to update' },
          item_price: { type: 'number', description: 'Updated price' },
          quantity: { type: 'number', description: 'Updated quantity' },
          discount_percentage: { type: 'number', description: 'Updated discount percentage (0-100)' },
          duration: { type: 'number', description: 'Updated duration' },
          comments: { type: 'string', description: 'Updated comments' },
          enabled_flag: { type: 'boolean', description: 'Whether the product is enabled' },
        },
        required: ['id', 'product_attachment_id'],
      },
      handler: async (args: unknown) => {
        const { id, product_attachment_id, ...updates } = UpdateDealProductSchema.parse(args);
        return client.put(`/deals/${id}/products/${product_attachment_id}`, updates);
      },
    },

    'deals/remove_product': {
      description: `Remove a product from a deal.

Detaches a product from the deal.

Workflow tips:
- Use deals/list_products to get product_attachment_id
- product_attachment_id is NOT the same as product_id
- Updates deal value automatically

Common use cases:
- Remove product: { "id": 123, "product_attachment_id": 789 }
- Workflow: list products, then remove by product_attachment_id`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal' },
          product_attachment_id: { type: 'number', description: 'ID of the deal-product attachment to remove' },
        },
        required: ['id', 'product_attachment_id'],
      },
      handler: async (args: unknown) => {
        const { id, product_attachment_id } = RemoveDealProductSchema.parse(args);
        return client.delete(`/deals/${id}/products/${product_attachment_id}`);
      },
    },

    'deals/list_products': {
      description: `List all products attached to a deal.

Returns all products associated with this deal, including pricing and quantity details.

Workflow tips:
- Shows product_attachment_id needed for updates/removal
- Set include_product_data=1 to get full product details
- Includes calculated totals with discounts
- Cached for 5 minutes

Common use cases:
- List products: { "id": 123 }
- With full details: { "id": 123, "include_product_data": 1 }
- Paginated: { "id": 123, "start": 0, "limit": 50 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal' },
          start: { type: 'number', description: 'Pagination start', default: 0 },
          limit: { type: 'number', description: 'Number of items to return', default: 100 },
          include_product_data: {
            type: 'number',
            enum: [0, 1],
            description: 'Whether to include full product data (1 = yes, 0 = no)',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, start, limit, include_product_data } = GetDealProductsSchema.parse(args);
        const params: Record<string, string | number | boolean> = {
          start: start ?? 0,
          limit: limit ?? 100,
        };
        if (include_product_data !== undefined) {
          params.include_product_data = include_product_data;
        }
        return client.get(`/deals/${id}/products`, params, { enabled: true, ttl: 300000 });
      },
    },
  };
}
