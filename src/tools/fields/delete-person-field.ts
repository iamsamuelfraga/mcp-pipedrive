import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeletePersonFieldSchema } from '../../schemas/person-field.js';
import type { PipedriveResponse } from '../../types/common.js';

export function getDeletePersonFieldTool(client: PipedriveClient) {
  return {
    fields_delete_person_field: {
      description: `Delete a custom person field by ID.

This soft-deletes the field on Pipedrive. Existing values are preserved on records but the field stops appearing in the UI and new payloads.

Use \`fields_bulk_delete_person_fields\` to delete several fields in one call.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'number',
            description: 'ID of the person field to delete',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const parsed = DeletePersonFieldSchema.parse(args);

        const response = await client.delete<PipedriveResponse<{ id: number }>>(
          `/personFields/${parsed.id}`
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
