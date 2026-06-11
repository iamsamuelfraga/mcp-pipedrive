import type { PipedriveClient } from '../../pipedrive-client.js';
import { UpdateProductFieldSchema } from '../../schemas/product-field.js';
import type { PipedriveResponse } from '../../types/common.js';

export function getUpdateProductFieldTool(client: PipedriveClient) {
  return {
    fields_update_product_field: {
      description: `Update an existing custom product field.

Note: \`field_type\` cannot be changed. For \`enum\`/\`set\` fields, \`options\` is the **full set** of options after update — include each existing option's \`id\` to preserve it, or omit \`id\` to add a new option.

Common use cases:
- Rename a field
- Add/remove options on an enum dropdown
- Toggle the field's visibility in the add form`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'number',
            description: 'ID of the product field to update',
          },
          name: {
            type: 'string',
            description: 'New display name of the field',
          },
          options: {
            type: 'array',
            description:
              'New full set of options. Include existing `id` to preserve, omit it to add.',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', description: 'Existing option ID' },
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
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const parsed = UpdateProductFieldSchema.parse(args);
        const { id, ...payload } = parsed;

        const response = await client.put<PipedriveResponse<unknown>>(
          `/productFields/${id}`,
          payload
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
    },
  };
}
