import type { PipedriveClient } from '../../pipedrive-client.js';
import { getListRolesTool } from './list.js';
import { getGetRoleTool } from './get.js';
import { getCreateRoleTool } from './create.js';
import { getUpdateRoleTool } from './update.js';
import { getDeleteRoleTool } from './delete.js';
import { getRoleAssignmentTools } from './assignments.js';
import { getRoleSettingsTools } from './settings.js';
import { getRolePipelinesTools } from './pipelines.js';

/**
 * Get all role-related tools for the MCP server
 *
 * This function aggregates all 14 role tools into a single object:
 * - List operations: list
 * - CRUD operations: get, create, update, delete
 * - Assignments: get_role_assignments, add_role_assignment, delete_role_assignment
 * - Settings: get_role_settings, add_role_setting, update_role_setting, delete_role_setting
 * - Pipelines: list_role_pipelines, update_role_pipelines
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Object containing all role tools with their configurations
 */
export function getRoleTools(client: PipedriveClient) {
  return {
    ...getListRolesTool(client),
    ...getGetRoleTool(client),
    ...getCreateRoleTool(client),
    ...getUpdateRoleTool(client),
    ...getDeleteRoleTool(client),
    ...getRoleAssignmentTools(client),
    ...getRoleSettingsTools(client),
    ...getRolePipelinesTools(client),
  };
}
