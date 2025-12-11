import type { PipedriveClient } from '../../pipedrive-client.js';
import { CreateProductSchema } from '../../schemas/product.js';
import type { Product } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for creating a new product
 */
export function getCreateProductTool(client: PipedriveClient) {
  return {
    name: 'products/create',
    description: `Create a new product in Pipedrive.

Required fields:
- name: Product name

Optional fields:
- code: Product code (SKU)
- description: Product description
- unit: Unit type (e.g., "pcs", "kg", "hours")
- tax: Tax percentage (0-100)
- active_flag: Whether product is active (default: true)
- selectable: Whether product can be selected in deals (default: true)
- visible_to: Visibility level (1=owner only, 3=entire company)
- owner_id: User who will own this product
- prices: Array of price objects with format: [{"price": 100, "currency": "USD", "cost": 50}]
- billing_frequency: One of: one-time, weekly, monthly, quarterly, semi-annually, annually
- billing_frequency_cycles: Number of billing cycles

Example prices array:
{
  "prices": [
    {"price": 100, "currency": "USD", "cost": 50, "overhead_cost": 10, "notes": "Standard price"},
    {"price": 85, "currency": "EUR", "cost": 45}
  ]
}`,
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Product name (required)',
        },
        code: {
          type: 'string',
          description: 'Product code/SKU',
        },
        description: {
          type: 'string',
          description: 'Product description',
        },
        unit: {
          type: 'string',
          description: 'Unit type (e.g., pcs, kg, hours)',
        },
        tax: {
          type: 'number',
          description: 'Tax percentage (0-100)',
        },
        active_flag: {
          type: 'boolean',
          description: 'Whether product is active',
        },
        selectable: {
          type: 'boolean',
          description: 'Whether product can be selected in deals',
        },
        visible_to: {
          type: 'string',
          description: 'Visibility: 1 (owner only), 3 (entire company)',
          enum: ['1', '3', '5', '7'],
        },
        owner_id: {
          type: 'number',
          description: 'ID of the user who will own this product',
        },
        prices: {
          type: 'array',
          description: 'Array of price objects',
          items: {
            type: 'object',
            properties: {
              price: {
                type: 'number',
                description: 'Product price',
              },
              currency: {
                type: 'string',
                description: 'Currency code (USD, EUR, etc.)',
              },
              cost: {
                type: 'number',
                description: 'Product cost',
              },
              overhead_cost: {
                type: 'number',
                description: 'Overhead cost',
              },
              notes: {
                type: 'string',
                description: 'Notes about this price',
              },
            },
            required: ['price', 'currency'],
          },
        },
        billing_frequency: {
          type: 'string',
          description: 'Billing frequency',
          enum: ['one-time', 'weekly', 'monthly', 'quarterly', 'semi-annually', 'annually'],
        },
        billing_frequency_cycles: {
          type: 'number',
          description: 'Number of billing cycles',
        },
      },
      required: ['name'],
    } as const,
    handler: async (params: unknown) => {
      const validated = CreateProductSchema.parse(params);

      const body: Record<string, unknown> = {
        name: validated.name,
      };

      if (validated.code) body.code = validated.code;
      if (validated.description) body.description = validated.description;
      if (validated.unit) body.unit = validated.unit;
      if (validated.tax !== undefined) body.tax = validated.tax;
      if (validated.active_flag !== undefined) body.active_flag = validated.active_flag;
      if (validated.selectable !== undefined) body.selectable = validated.selectable;
      if (validated.visible_to) body.visible_to = validated.visible_to;
      if (validated.owner_id) body.owner_id = validated.owner_id;
      if (validated.prices) body.prices = validated.prices;
      if (validated.billing_frequency) body.billing_frequency = validated.billing_frequency;
      if (validated.billing_frequency_cycles !== undefined) {
        body.billing_frequency_cycles = validated.billing_frequency_cycles;
      }

      const response = await client.post<PipedriveResponse<Product>>(
        '/products',
        body
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
