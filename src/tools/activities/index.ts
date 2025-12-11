import type { PipedriveClient } from '../../pipedrive-client.js';
import { createListActivitiesTool } from './list.js';
import { createListAllActivitiesTool } from './list-all.js';
import { createCreateActivityTool } from './create.js';
import { createGetActivityTool } from './get.js';
import { createUpdateActivityTool } from './update.js';
import { createDeleteActivityTool } from './delete.js';
import { createBulkDeleteActivitiesTool } from './bulk-delete.js';
import { createMarkActivityAsDoneTool } from './mark-as-done.js';
import { createListActivitiesByDealTool } from './list-by-deal.js';

export function getActivityTools(client: PipedriveClient) {
  return [
    createListActivitiesTool(client),
    createListAllActivitiesTool(client),
    createCreateActivityTool(client),
    createGetActivityTool(client),
    createUpdateActivityTool(client),
    createDeleteActivityTool(client),
    createBulkDeleteActivitiesTool(client),
    createMarkActivityAsDoneTool(client),
    createListActivitiesByDealTool(client),
  ];
}
