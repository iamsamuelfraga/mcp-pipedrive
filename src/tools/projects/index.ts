import type { PipedriveClient } from '../../pipedrive-client.js';
import { createListProjectsTool } from './list.js';
import { createGetProjectTool } from './get.js';
import { createCreateProjectTool } from './create.js';
import { createUpdateProjectTool } from './update.js';
import { createDeleteProjectTool } from './delete.js';
import { createArchiveProjectTool } from './archive.js';
import { createGetProjectPhasesTool, createGetProjectPhaseTool } from './phases.js';
import { createGetProjectTasksTool } from './tasks.js';
import { createGetProjectActivitiesTool } from './activities.js';
import {
  createGetProjectPlanTool,
  createUpdateProjectPlanActivityTool,
  createUpdateProjectPlanTaskTool,
} from './plan.js';
import { createGetProjectGroupsTool } from './groups.js';
import { createGetProjectBoardsTool, createGetProjectBoardTool } from './boards.js';

/**
 * Get all project-related tools for the MCP server
 *
 * This function aggregates all 14 project tools into a single array:
 * - List operations: list
 * - CRUD operations: get, create, update, delete
 * - Archive operations: archive
 * - Phases: list phases, get phase
 * - Tasks: list tasks
 * - Activities: list activities
 * - Plan: get plan, update activity in plan, update task in plan
 * - Groups: list groups
 * - Boards: list boards, get board
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Array containing all project tools with their configurations
 */
export function getProjectTools(client: PipedriveClient) {
  return [
    // Core CRUD operations
    createListProjectsTool(client),
    createGetProjectTool(client),
    createCreateProjectTool(client),
    createUpdateProjectTool(client),
    createDeleteProjectTool(client),

    // Archive operations
    createArchiveProjectTool(client),

    // Phases
    createGetProjectPhasesTool(client),
    createGetProjectPhaseTool(client),

    // Tasks
    createGetProjectTasksTool(client),

    // Activities
    createGetProjectActivitiesTool(client),

    // Plan
    createGetProjectPlanTool(client),
    createUpdateProjectPlanActivityTool(client),
    createUpdateProjectPlanTaskTool(client),

    // Groups
    createGetProjectGroupsTool(client),

    // Boards
    createGetProjectBoardsTool(client),
    createGetProjectBoardTool(client),
  ];
}
