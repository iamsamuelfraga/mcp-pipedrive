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
    'channels/create': getCreateChannelTool(client),
    'channels/delete': getDeleteChannelTool(client),
    'channels/receive-message': getReceiveMessageTool(client),
    'channels/delete-conversation': getDeleteConversationTool(client),
  };
}
