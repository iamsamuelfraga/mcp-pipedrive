import type { PipedriveClient } from '../../pipedrive-client.js';
import { getListGoalsTool } from './list.js';
import { getCreateGoalTool } from './create.js';
import { getUpdateGoalTool } from './update.js';
import { getDeleteGoalTool } from './delete.js';
import { getGetGoalResultsTool } from './get-results.js';

/**
 * Get all goal-related tools for the MCP server
 *
 * This function aggregates all 5 goal tools into a single object:
 * - List operations: list (find goals with filters)
 * - CRUD operations: create, update, delete
 * - Results: get_results (retrieve goal progress)
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Object containing all goal tools with their configurations
 */
export function getGoalTools(client: PipedriveClient) {
  return {
    ...getListGoalsTool(client),
    ...getCreateGoalTool(client),
    ...getUpdateGoalTool(client),
    ...getDeleteGoalTool(client),
    ...getGetGoalResultsTool(client),
  };
}
