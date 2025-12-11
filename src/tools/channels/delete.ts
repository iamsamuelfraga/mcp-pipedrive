import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeleteChannelSchema } from '../../schemas/channel.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for deleting a channel
 */
export function getDeleteChannelTool(client: PipedriveClient) {
  return {
    name: 'channels_delete',
    description: `Delete an existing messenger's channel and all related entities (conversations and messages).

This endpoint requires the **Messengers integration** OAuth scope and the Messaging manifest ready for the Messaging app extension.

Warning: This action cannot be undone. The channel and all related conversations and messages will be permanently deleted.

Required fields:
- id: The ID of the channel provided by the integration

Example:
{
  "id": "e283f878-7ef9-4294-8e5c-04a7d003fd92"
}`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the channel to delete (required)',
        },
      },
      required: ['id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = DeleteChannelSchema.parse(params);

      const response = await client.delete<PipedriveResponse<{ success: boolean }>>(
        `/channels/${validated.id}`
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
