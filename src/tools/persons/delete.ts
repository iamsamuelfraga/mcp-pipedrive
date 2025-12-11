import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeletePersonSchema } from '../../schemas/person.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for deleting a person
 */
export function getDeletePersonTool(client: PipedriveClient) {
  return {
    name: 'persons_delete',
    description: `Delete a person from Pipedrive.

Warning: This action cannot be undone. The person will be permanently deleted.

Note: Deleting a person does not automatically delete associated:
- Deals (they will remain but without the person link)
- Activities (they will remain but without the person link)
- Notes (they will remain but without the person link)`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Person ID to delete',
        },
      },
      required: ['id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = DeletePersonSchema.parse(params);

      const response = await client.delete<PipedriveResponse<{ id: number }>>(
        `/persons/${validated.id}`
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
