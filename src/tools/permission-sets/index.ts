import type { PipedriveClient } from '../../pipedrive-client.js';
import { getListPermissionSetsTool } from './list.js';
import { getGetPermissionSetTool } from './get.js';
import { getPermissionSetAssignmentsTool } from './assignments.js';

/**
 * Get all permission set-related tools for the MCP server
 *
 * This function aggregates all 3 permission set tools into a single object:
 * - List operations: list
 * - Get operations: get
 * - Assignment operations: get_assignments
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Object containing all permission set tools with their configurations
 */
export function getPermissionSetTools(client: PipedriveClient) {
  return {
    ...getListPermissionSetsTool(client),
    ...getGetPermissionSetTool(client),
    ...getPermissionSetAssignmentsTool(client),
  };
}
