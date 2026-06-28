import type { PipedriveClient } from '../../pipedrive-client.js';
import { getListStagesTool } from './list.js';
import { getGetStageTool } from './get.js';
import { getCreateStageTool } from './create.js';
import { getUpdateStageTool } from './update.js';
import { getDeleteStageTool } from './delete.js';

/**
 * Stage tools (Pipedrive API v2). Provides full CRUD over individual stages,
 * complementing the nested-list convenience `pipelines_get_stages` (v1).
 */
export function getStageTools(client: PipedriveClient) {
  return {
    ...getListStagesTool(client),
    ...getGetStageTool(client),
    ...getCreateStageTool(client),
    ...getUpdateStageTool(client),
    ...getDeleteStageTool(client),
  };
}
