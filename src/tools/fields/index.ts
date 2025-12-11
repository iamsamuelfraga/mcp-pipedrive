import type { PipedriveClient } from '../../pipedrive-client.js';
import { getListDealFieldsTool } from './deal-fields.js';
import { getListPersonFieldsTool } from './person-fields.js';
import { getListOrganizationFieldsTool } from './org-fields.js';
import { getListActivityFieldsTool } from './activity-fields.js';
import { getListProductFieldsTool } from './product-fields.js';
import { getGetFieldTool } from './get-field.js';
import { getListAllFieldsTool } from './all-fields.js';
import { getSearchFieldsTool } from './search-fields.js';

/**
 * Get all field-related tools for the MCP server
 *
 * This function aggregates all 8 field discovery tools into a single object:
 * - Entity-specific field lists: list_deal_fields, list_person_fields, list_organization_fields, list_activity_fields, list_product_fields
 * - Field retrieval: get_field
 * - Aggregated lists: list_all_fields
 * - Search: search_fields
 *
 * These tools help LLMs discover what custom fields are available in Pipedrive
 * before creating or updating entities. Field definitions are heavily cached
 * (15 minutes) as they rarely change.
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Object containing all field tools with their configurations
 */
export function getFieldTools(client: PipedriveClient) {
  return {
    ...getListDealFieldsTool(client),
    ...getListPersonFieldsTool(client),
    ...getListOrganizationFieldsTool(client),
    ...getListActivityFieldsTool(client),
    ...getListProductFieldsTool(client),
    ...getGetFieldTool(client),
    ...getListAllFieldsTool(client),
    ...getSearchFieldsTool(client),
  };
}
