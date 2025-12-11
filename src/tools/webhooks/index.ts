import type { PipedriveClient } from '../../pipedrive-client.js';
import { getListWebhooksTool } from './list.js';
import { getCreateWebhookTool } from './create.js';
import { getDeleteWebhookTool } from './delete.js';

/**
 * Get all webhook-related tools for the MCP server
 *
 * This function aggregates all 3 webhook tools into a single object:
 * - List operation: list
 * - Create operation: create
 * - Delete operation: delete
 *
 * Webhooks allow you to receive real-time notifications when events occur in Pipedrive.
 * Common use cases include:
 * - Syncing data with external systems
 * - Triggering automation workflows
 * - Logging events for audit purposes
 * - Integrating with third-party services
 *
 * Note: Webhook data is never cached to ensure you always see the current state.
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Object containing all webhook tools with their configurations
 */
export function getWebhookTools(client: PipedriveClient) {
  return {
    ...getListWebhooksTool(client),
    ...getCreateWebhookTool(client),
    ...getDeleteWebhookTool(client),
  };
}
