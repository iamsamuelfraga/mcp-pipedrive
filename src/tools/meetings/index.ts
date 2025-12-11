import type { PipedriveClient } from '../../pipedrive-client.js';
import { getLinkUserProviderTool } from './link-user.js';
import { getDeleteUserProviderLinkTool } from './delete-link.js';

/**
 * Get all meeting-related tools for the MCP server
 *
 * This function aggregates all 2 meeting tools into a single object:
 * - Link operations: link_user_provider
 * - Delete operations: delete_user_provider_link
 *
 * These tools manage the integration between Pipedrive users and video calling providers,
 * allowing users to access video calling features within Pipedrive.
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Object containing all meeting tools with their configurations
 */
export function getMeetingTools(client: PipedriveClient) {
  return {
    ...getLinkUserProviderTool(client),
    ...getDeleteUserProviderLinkTool(client),
  };
}
