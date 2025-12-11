import type { PipedriveClient } from '../../pipedrive-client.js';
import { ReceiveMessageSchema } from '../../schemas/channel.js';
import type { ChannelMessage } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for receiving an incoming message
 */
export function getReceiveMessageTool(client: PipedriveClient) {
  return {
    name: 'channels_receive_message',
    description: `Add an incoming message to a conversation in Pipedrive.

This endpoint requires the **Messengers integration** OAuth scope and the Messaging manifest ready for the Messaging app extension.

Required fields:
- id: ID of the message
- channel_id: ID of the channel the message was sent to
- sender_id: ID of the message sender
- conversation_id: ID of the conversation this message belongs to
- message: Content of the message
- status: Status of the message (e.g., sent, delivered, read)
- created_at: When the message was created (ISO 8601 format)

Optional fields:
- reply_by: When a reply is expected by (ISO 8601 format)
- conversation_link: Link to the conversation in the provider system
- attachments: Array of message attachments

Example:
{
  "id": "e283f878-7ef9-4294-8e5c-04a7d003fd92",
  "channel_id": "a8aa4db0-91bb-4e90-b9c0-0c6291307e2f",
  "sender_id": "5d4bd467-d847-4088-ae43-0c7614233bab",
  "conversation_id": "063ffa46-831c-4027-a04c-b65e17f077b7",
  "message": "This is a message",
  "status": "sent",
  "created_at": "2022-03-01T07:58:35.449Z",
  "reply_by": "2022-03-01T07:58:35.449Z",
  "conversation_link": "http://my-server.com/conversations/063ffa46-831c-4027-a04c-b65e17f077b7",
  "attachments": [
    {
      "id": "b0369d1d-6b6a-4293-88b9-e2924782d47e",
      "type": "image/png",
      "name": "Image Name",
      "size": 600,
      "url": "http://my-server.com/images/b0369d1d-6b6a-4293-88b9-e2924782d47e.png",
      "preview_url": "http://my-server.com/images/b0369d1d-6b6a-4293-88b9-e2924782d47e.preview.png"
    }
  ]
}`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the message (required)',
        },
        channel_id: {
          type: 'string',
          description: 'ID of the channel the message was sent to (required)',
        },
        sender_id: {
          type: 'string',
          description: 'ID of the message sender (required)',
        },
        conversation_id: {
          type: 'string',
          description: 'ID of the conversation this message belongs to (required)',
        },
        message: {
          type: 'string',
          description: 'Content of the message (required)',
        },
        status: {
          type: 'string',
          description: 'Status of the message (e.g., sent, delivered, read) (required)',
        },
        created_at: {
          type: 'string',
          description: 'When the message was created in ISO 8601 format (required)',
        },
        reply_by: {
          type: 'string',
          description: 'When a reply is expected by in ISO 8601 format',
        },
        conversation_link: {
          type: 'string',
          description: 'Link to the conversation in the provider system',
        },
        attachments: {
          type: 'array',
          description: 'Array of message attachments',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'ID of the attachment (required)',
              },
              type: {
                type: 'string',
                description: 'MIME type of the attachment (e.g., image/png) (required)',
              },
              url: {
                type: 'string',
                description: 'URL where the attachment can be accessed (required)',
              },
              name: {
                type: 'string',
                description: 'Name of the attachment file (required)',
              },
              size: {
                type: 'number',
                description: 'Size of the attachment in bytes (required)',
              },
              preview_url: {
                type: 'string',
                description: 'URL for a preview of the attachment',
              },
              link_expires: {
                type: 'boolean',
                description: 'Whether the attachment link expires',
              },
            },
            required: ['id', 'type', 'url', 'name', 'size'],
          },
        },
      },
      required: [
        'id',
        'channel_id',
        'sender_id',
        'conversation_id',
        'message',
        'status',
        'created_at',
      ],
    } as const,
    handler: async (params: unknown) => {
      const validated = ReceiveMessageSchema.parse(params);

      const body: Record<string, unknown> = {
        id: validated.id,
        channel_id: validated.channel_id,
        sender_id: validated.sender_id,
        conversation_id: validated.conversation_id,
        message: validated.message,
        status: validated.status,
        created_at: validated.created_at,
      };

      if (validated.reply_by) body.reply_by = validated.reply_by;
      if (validated.conversation_link) body.conversation_link = validated.conversation_link;
      if (validated.attachments && validated.attachments.length > 0) {
        body.attachments = validated.attachments;
      }

      const response = await client.post<PipedriveResponse<ChannelMessage>>(
        '/channels/messages/receive',
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
