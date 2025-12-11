import type { PipedriveClient } from '../../pipedrive-client.js';
import { getUniversalSearchTool } from './universal.js';
import { getSearchByFieldTool } from './by-field.js';
import { getSearchDealsTool } from './deals.js';
import { getSearchPersonsTool } from './persons.js';
import { getSearchOrganizationsTool } from './organizations.js';
import { getSearchProductsTool } from './products.js';

/**
 * Get all search-related tools for the MCP server
 *
 * This function aggregates all 6 search tools into a single object:
 * - Universal search: universal (search across all types)
 * - Field search: by_field (search specific field)
 * - Entity searches: deals, persons, organizations, products
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Object containing all search tools with their configurations
 */
export function getSearchTools(client: PipedriveClient) {
  return {
    ...getUniversalSearchTool(client),
    ...getSearchByFieldTool(client),
    ...getSearchDealsTool(client),
    ...getSearchPersonsTool(client),
    ...getSearchOrganizationsTool(client),
    ...getSearchProductsTool(client),
  };
}
