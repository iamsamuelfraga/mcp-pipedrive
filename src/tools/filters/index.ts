import type { PipedriveClient } from '../../pipedrive-client.js';
import { getListFiltersTools } from './list.js';
import { getGetFilterTool } from './get.js';
import { getCreateFilterTool } from './create.js';
import { getUpdateFilterTool } from './update.js';
import { getDeleteFilterTool } from './delete.js';
import { getBulkDeleteFiltersTool } from './bulk.js';
import { getFilterHelpersTool } from './helpers.js';

/**
 * Get all filter-related tools for the MCP server
 *
 * This function aggregates all 7 filter tools into a single object:
 * - List operations: list
 * - CRUD operations: create, get, update, delete
 * - Bulk operations: bulk_delete
 * - Helpers: helpers (get available filter fields and operators)
 *
 * Filters are used to create reusable condition sets that can be applied
 * when fetching lists of deals, leads, persons, organizations, or products.
 *
 * Key features:
 * - Support for 5 filter types: deals, org, people, products, activities
 * - Complex condition structure with AND/OR logic
 * - Heavy caching (15 minutes) for optimal performance
 * - Helper endpoint to discover available fields and operators
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Object containing all filter tools with their configurations
 */
export function getFilterTools(client: PipedriveClient) {
  return {
    ...getListFiltersTools(client),
    ...getGetFilterTool(client),
    ...getCreateFilterTool(client),
    ...getUpdateFilterTool(client),
    ...getDeleteFilterTool(client),
    ...getBulkDeleteFiltersTool(client),
    ...getFilterHelpersTool(client),
  };
}
