import type { PipedriveClient } from '../../pipedrive-client.js';
import { getCreateChannelTool } from './create.js';
import { getDeleteChannelTool } from './delete.js';
import { getReceiveMessageTool } from './receive-message.js';
import { getDeleteConversationTool } from './delete-conversation.js';

/**
 * Get all channel-related tools
 */
export function getChannelTools(client: PipedriveClient) {
  return {
    'channels_create': getCreateChannelTool(client),
    'channels_delete': getDeleteChannelTool(client),
    'channels_receive_message': getReceiveMessageTool(client),
    'channels_delete_conversation': getDeleteConversationTool(client),
  };
}
