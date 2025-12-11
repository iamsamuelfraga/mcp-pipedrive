import type { PipedriveClient } from '../../pipedrive-client.js';
import { getListTasksTool } from './list.js';
import { getGetTaskTool } from './get.js';
import { getCreateTaskTool } from './create.js';
import { getUpdateTaskTool } from './update.js';
import { getDeleteTaskTool } from './delete.js';

/**
 * Get all task-related tools for the MCP server
 *
 * This function aggregates all 5 task tools into a single object:
 * - List operations: list (with cursor-based pagination)
 * - CRUD operations: get, create, update, delete
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Object containing all task tools with their configurations
 */
export function getTaskTools(client: PipedriveClient) {
  return {
    ...getListTasksTool(client),
    ...getGetTaskTool(client),
    ...getCreateTaskTool(client),
    ...getUpdateTaskTool(client),
    ...getDeleteTaskTool(client),
  };
}
