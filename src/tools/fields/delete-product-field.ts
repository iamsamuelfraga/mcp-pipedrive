import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeleteProductFieldSchema } from '../../schemas/product-field.js';
import type { PipedriveResponse } from '../../types/common.js';

export function getDeleteProductFieldTool(client: PipedriveClient) {
  return {
    fields_delete_product_field: {
      description: `Delete a custom product field by ID.

This soft-deletes the field on Pipedrive. Existing values are preserved on records but the field stops appearing in the UI and new payloads.

Use \`fields_bulk_delete_product_fields\` to delete several fields in one call.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'number',
            description: 'ID of the product field to delete',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const parsed = DeleteProductFieldSchema.parse(args);

        const response = await client.delete<PipedriveResponse<{ id: number }>>(
          `/productFields/${parsed.id}`
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
