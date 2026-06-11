import type { PipedriveClient } from '../../pipedrive-client.js';
import { CreateProductFieldSchema } from '../../schemas/product-field.js';
import type { PipedriveResponse } from '../../types/common.js';

export function getCreateProductFieldTool(client: PipedriveClient) {
  return {
    fields_create_product_field: {
      description: `Create a new custom field for products.

For \`enum\` and \`set\` field types, you must provide \`options\` (a non-empty array of \`{ label }\` objects).

Common use cases:
- Add a "Product Category" dropdown to products
- Add a custom text field (e.g., "SKU Code")
- Add a numeric field (e.g., "Weight (kg)")

After creation, the field's \`key\` is the hash you must use in Product create/update payloads. Field definitions are cached for 15 minutes — call \`fields_list_product_fields\` after a brief delay to see it reflected.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: {
            type: 'string',
            description: 'Display name of the field',
          },
          field_type: {
            type: 'string',
            enum: [
              'varchar',
              'varchar_auto',
              'text',
              'double',
              'monetary',
              'date',
              'set',
              'enum',
              'user',
              'org',
              'people',
              'phone',
              'time',
              'timerange',
              'daterange',
              'address',
            ],
            description: 'Type of the field. `enum`/`set` require `options`.',
          },
          options: {
            type: 'array',
            description: 'Required for `enum` and `set` field types',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', description: 'Existing option ID (when updating)' },
                label: { type: 'string', description: 'Visible label of the option' },
              },
              required: ['label'],
            },
          },
          add_visible_flag: {
            type: 'boolean',
            description: 'Whether the field is shown in the "add" form by default',
          },
        },
        required: ['name', 'field_type'],
      },
      handler: async (args: unknown) => {
        const parsed = CreateProductFieldSchema.parse(args);

        const response = await client.post<PipedriveResponse<unknown>>('/productFields', parsed);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      },
    },
  };
}
