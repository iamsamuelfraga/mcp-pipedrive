import type { PipedriveClient } from '../../pipedrive-client.js';
import { CreateChannelSchema } from '../../schemas/channel.js';
import type { Channel } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for creating a new channel
 */
export function getCreateChannelTool(client: PipedriveClient) {
  return {
    name: 'channels/create',
    description: `Create a new messaging channel in Pipedrive. Only admins are able to register new channels.

This endpoint requires the **Messengers integration** OAuth scope and the Messaging manifest ready for the Messaging app extension.

Required fields:
- name: Name of the channel
- provider_channel_id: ID of the channel in the provider system

Optional fields:
- avatar_url: Avatar URL for the channel
- template_support: Whether the channel supports message templates (default: false)
- provider_type: Type of messaging provider (other, facebook, instagram, whatsapp, telegram, line, viber) (default: other)

Example:
{
  "name": "My Channel",
  "provider_channel_id": "e283f878-7ef9-4294-8e5c-04a7d003fd92",
  "avatar_url": "http://my-domain.com/images/test.png",
  "template_support": false,
  "provider_type": "whatsapp"
}`,
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the channel (required)',
        },
        provider_channel_id: {
          type: 'string',
          description: 'ID of the channel in the provider system (required)',
        },
        avatar_url: {
          type: 'string',
          description: 'Avatar URL for the channel',
        },
        template_support: {
          type: 'boolean',
          description: 'Whether the channel supports message templates (default: false)',
        },
        provider_type: {
          type: 'string',
          description: 'Type of messaging provider',
          enum: ['other', 'facebook', 'instagram', 'whatsapp', 'telegram', 'line', 'viber'],
        },
      },
      required: ['name', 'provider_channel_id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = CreateChannelSchema.parse(params);

      const body: Record<string, unknown> = {
        name: validated.name,
        provider_channel_id: validated.provider_channel_id,
      };

      if (validated.avatar_url) body.avatar_url = validated.avatar_url;
      if (validated.template_support !== undefined)
        body.template_support = validated.template_support;
      if (validated.provider_type) body.provider_type = validated.provider_type;

      const response = await client.post<PipedriveResponse<Channel>>('/channels', body);

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
