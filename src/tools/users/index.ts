import type { PipedriveClient } from '../../pipedrive-client.js';
import { getListUsersTool } from './list.js';
import { getGetUserTool } from './get.js';
import { getCreateUserTool } from './create.js';
import { getUpdateUserTool } from './update.js';
import { getCurrentUserTool } from './current.js';
import { getUserFollowerTools } from './followers.js';
import { getUserPermissionsTool } from './permissions.js';
import { getUserRoleSettingsTool } from './role-settings.js';
import { getFindUsersTool } from './find.js';
import { getUserRoleAssignmentsTool } from './role-assignments.js';

/**
 * Get all user-related tools for the MCP server
 *
 * This function aggregates all 12 user tools into a single object:
 * - List operations: list
 * - CRUD operations: get, create, update
 * - Current user: get_current
 * - Followers: list_followers, add_follower, delete_follower
 * - Permissions: get_permissions
 * - Role settings: list_role_settings
 * - Find: find
 * - Role assignments: list_role_assignments
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Object containing all user tools with their configurations
 */
export function getUserTools(client: PipedriveClient) {
  return {
    ...getListUsersTool(client),
    ...getGetUserTool(client),
    ...getCreateUserTool(client),
    ...getUpdateUserTool(client),
    ...getCurrentUserTool(client),
    ...getUserFollowerTools(client),
    ...getUserPermissionsTool(client),
    ...getUserRoleSettingsTool(client),
    ...getFindUsersTool(client),
    ...getUserRoleAssignmentsTool(client),
  };
}
