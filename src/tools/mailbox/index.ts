import type { PipedriveClient } from '../../pipedrive-client.js';
import { createGetMailThreadsTool } from './get-threads.js';
import { createGetMailThreadTool } from './get-thread.js';
import { createGetMailThreadMessagesTool } from './get-thread-messages.js';
import { createUpdateMailThreadTool } from './update-thread.js';
import { createDeleteMailThreadTool } from './delete-thread.js';
import { createGetMailMessageTool } from './get-message.js';

export function getMailboxTools(client: PipedriveClient) {
  return [
    createGetMailThreadsTool(client),
    createGetMailThreadTool(client),
    createGetMailThreadMessagesTool(client),
    createUpdateMailThreadTool(client),
    createDeleteMailThreadTool(client),
    createGetMailMessageTool(client),
  ];
}
