import type { PipedriveClient } from '../../pipedrive-client.js';
import { UpdateProductSchema } from '../../schemas/product.js';
import type { Product } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for updating an existing product
 */
export function getUpdateProductTool(client: PipedriveClient) {
  return {
    name: 'products/update',
    description: `Update an existing product in Pipedrive.

All fields are optional except id. Only provide the fields you want to update.

Updatable fields:
- name: Product name
- code: Product code (SKU)
- description: Product description
- unit: Unit type
- tax: Tax percentage
- active_flag: Whether product is active
- selectable: Whether product can be selected in deals
- visible_to: Visibility level
- owner_id: Product owner
- prices: Array of price objects
- billing_frequency: Billing frequency
- billing_frequency_cycles: Number of billing cycles

Note: When updating prices, the entire prices array is replaced.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Product ID (required)',
        },
        name: {
          type: 'string',
          description: 'Product name',
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
          description: 'Unit type',
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
          description: 'Visibility level',
          enum: ['1', '3', '5', '7'],
        },
        owner_id: {
          type: 'number',
          description: 'ID of the user who will own this product',
        },
        prices: {
          type: 'array',
          description: 'Array of price objects (replaces existing prices)',
          items: {
            type: 'object',
            properties: {
              price: {
                type: 'number',
                description: 'Product price',
              },
              currency: {
                type: 'string',
                description: 'Currency code',
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
                description: 'Notes',
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
      required: ['id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = UpdateProductSchema.parse(params);

      const body: Record<string, unknown> = {};

      if (validated.name) body.name = validated.name;
      if (validated.code !== undefined) body.code = validated.code;
      if (validated.description !== undefined) body.description = validated.description;
      if (validated.unit !== undefined) body.unit = validated.unit;
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

      const response = await client.put<PipedriveResponse<Product>>(
        `/products/${validated.id}`,
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
