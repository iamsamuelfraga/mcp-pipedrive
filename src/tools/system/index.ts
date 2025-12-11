import type { PipedriveClient } from '../../pipedrive-client.js';
import { getMetricsTool } from './metrics.js';
import { getHealthCheckTool } from './health.js';
import { getCurrentUserTool } from './user.js';
import { getListCurrenciesTool } from './currencies.js';
import { getResetCacheTool } from './reset-cache.js';
import { getListAddonsTool } from './addons.js';
import { getRecentsTool } from './recents.js';
import { getUserConnectionsTool } from './user-connections.js';
import { getUserSettingsTool } from './user-settings.js';

/**
 * Get all system-related tools for the MCP server
 *
 * This function aggregates all 9 system utility tools into a single object:
 * - Monitoring: get_metrics, health_check
 * - User info: get_current_user, get_user_settings, get_user_connections
 * - Configuration: list_currencies, list_addons
 * - Activity: get_recents
 * - Utilities: reset_cache
 *
 * These tools provide system utilities, monitoring capabilities, and meta-information
 * about the MCP server and Pipedrive account.
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Object containing all system tools with their configurations
 */
export function getSystemTools(client: PipedriveClient) {
  return {
    ...getMetricsTool(client),
    ...getHealthCheckTool(client),
    ...getCurrentUserTool(client),
    ...getListCurrenciesTool(client),
    ...getResetCacheTool(client),
    ...getListAddonsTool(client),
    ...getRecentsTool(client),
    ...getUserConnectionsTool(client),
    ...getUserSettingsTool(client),
  };
}
