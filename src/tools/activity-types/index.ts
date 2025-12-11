import type { PipedriveClient } from '../../pipedrive-client.js';
import { getListActivityTypesTool } from './list.js';
import { getCreateActivityTypeTool } from './create.js';
import { getUpdateActivityTypeTool } from './update.js';
import { getDeleteActivityTypeTool } from './delete.js';
import { getBulkDeleteActivityTypesTool } from './bulk-delete.js';

/**
 * Get all activity type-related tools for the MCP server
 *
 * This function aggregates all 5 activity type tools into a single object:
 * - List operations: list
 * - CRUD operations: create, update, delete
 * - Bulk operations: bulk_delete
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Object containing all activity type tools with their configurations
 */
export function getActivityTypeTools(client: PipedriveClient) {
  return {
    ...getListActivityTypesTool(client),
    ...getCreateActivityTypeTool(client),
    ...getUpdateActivityTypeTool(client),
    ...getDeleteActivityTypeTool(client),
    ...getBulkDeleteActivityTypesTool(client),
  };
}
