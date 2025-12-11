import type { PipedriveClient } from '../../pipedrive-client.js';
import { getListLeadsTools } from './list.js';
import { getListArchivedLeadsTool } from './archived.js';
import { getCreateLeadTool } from './create.js';
import { getGetLeadTool } from './get.js';
import { getUpdateLeadTool } from './update.js';
import { getDeleteLeadTool } from './delete.js';
import { getSearchLeadsTool } from './search.js';
import { getLeadLabelsTool } from './labels.js';
import { getLeadSourcesTool } from './sources.js';

/**
 * Get all lead-related tools for the MCP server
 *
 * This function aggregates all 8 lead tools into a single object:
 * - List operations: list, list_all_auto
 * - CRUD operations: create, get, update, delete
 * - Search operations: search
 * - Reference data: get_labels, get_sources
 *
 * Leads are Pipedrive's modern lead management system, stored in the Leads Inbox
 * before they are archived or converted to deals. Leads must be linked to a person
 * or organization (or both) and can contain most fields that deals have.
 *
 * Key differences from other entities:
 * - Lead IDs are UUIDs (not integers)
 * - Leads inherit custom fields structure from deals
 * - All API-created leads have source_name "API" and origin "API"
 * - Labels and sources are reference data (heavily cached)
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Object containing all lead tools with their configurations
 */
export function getLeadTools(client: PipedriveClient) {
  return {
    ...getListLeadsTools(client),
    ...getListArchivedLeadsTool(client),
    ...getCreateLeadTool(client),
    ...getGetLeadTool(client),
    ...getUpdateLeadTool(client),
    ...getDeleteLeadTool(client),
    ...getSearchLeadsTool(client),
    ...getLeadLabelsTool(client),
    ...getLeadSourcesTool(client),
  };
}
