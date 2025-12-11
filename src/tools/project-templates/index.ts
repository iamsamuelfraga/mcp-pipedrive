import type { PipedriveClient } from '../../pipedrive-client.js';
import { createListProjectTemplatesTool } from './list.js';
import { createGetProjectTemplateTool } from './get.js';

/**
 * Get all project template-related tools for the MCP server
 *
 * This function aggregates all project template tools:
 * - List operations: list (cursor-based pagination)
 * - Read operations: get
 *
 * Project templates are reusable blueprints that define the structure
 * of projects, including phases, task groups, tasks, and activities.
 * Templates enable standardized project creation across an organization.
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Array containing all project template tools
 */
export function getProjectTemplateTools(client: PipedriveClient) {
  return [
    createListProjectTemplatesTool(client),
    createGetProjectTemplateTool(client),
  ];
}
