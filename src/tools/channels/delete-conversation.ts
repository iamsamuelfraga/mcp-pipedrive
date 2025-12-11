import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeleteConversationSchema } from '../../schemas/channel.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for deleting a conversation
 */
export function getDeleteConversationTool(client: PipedriveClient) {
  return {
    name: 'channels/delete-conversation',
    description: `Delete an existing conversation from a channel.

This endpoint requires the **Messengers integration** OAuth scope and the Messaging manifest ready for the Messaging app extension.

Warning: This action cannot be undone. The conversation and all its messages will be permanently deleted.

Required fields:
- channel_id: ID of the channel
- conversation_id: ID of the conversation to delete

Example:
{
  "channel_id": "e283f878-7ef9-4294-8e5c-04a7d003fd92",
  "conversation_id": "063ffa46-831c-4027-a04c-b65e17f077b7"
}`,
    inputSchema: {
      type: 'object',
      properties: {
        channel_id: {
          type: 'string',
          description: 'ID of the channel (required)',
        },
        conversation_id: {
          type: 'string',
          description: 'ID of the conversation to delete (required)',
        },
      },
      required: ['channel_id', 'conversation_id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = DeleteConversationSchema.parse(params);

      const response = await client.delete<PipedriveResponse<{ success: boolean }>>(
        `/channels/${validated.channel_id}/conversations/${validated.conversation_id}`
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
