import type { PipedriveClient } from '../../pipedrive-client.js';
import { getListPersonsTool, getListAllPersonsAutoTool } from './list.js';
import { getCreatePersonTool } from './create.js';
import { getGetPersonTool } from './get.js';
import { getUpdatePersonTool } from './update.js';
import { getDeletePersonTool } from './delete.js';
import { getSearchPersonsTool } from './search.js';
import { getListPersonDealsTool } from './deals.js';
import { getListPersonActivitiesTool } from './activities.js';
import { getListPersonFilesTool } from './files.js';
import { getAddPersonFollowerTool, getListPersonFollowersTool } from './followers.js';
import { getDeletePersonFollowerTool } from './follower-actions.js';
import { getListPersonChangelogTool, getListPersonFlowTool } from './updates.js';
import { getListPersonMailMessagesTool } from './mail.js';
import { getMergePersonsTool } from './merge.js';
import { getListPersonPermittedUsersTool } from './permissions.js';
import { getDeletePersonPictureTool, getAddPersonPictureTool } from './picture.js';
import { getListPersonProductsTool } from './products.js';
import { getBulkDeletePersonsTool } from './bulk.js';
import { getPersonsCollectionTool } from './collection.js';

/**
 * Get all person-related tools
 */
export function getPersonTools(client: PipedriveClient) {
  return [
    // List and pagination
    getListPersonsTool(client),
    getListAllPersonsAutoTool(client),
    getPersonsCollectionTool(client),

    // CRUD operations
    getCreatePersonTool(client),
    getGetPersonTool(client),
    getUpdatePersonTool(client),
    getDeletePersonTool(client),
    getBulkDeletePersonsTool(client),

    // Search
    getSearchPersonsTool(client),

    // Related entities
    getListPersonDealsTool(client),
    getListPersonActivitiesTool(client),
    getListPersonFilesTool(client),
    getListPersonProductsTool(client),
    getListPersonMailMessagesTool(client),

    // Followers
    getAddPersonFollowerTool(client),
    getListPersonFollowersTool(client),
    getDeletePersonFollowerTool(client),

    // Updates and changelog
    getListPersonChangelogTool(client),
    getListPersonFlowTool(client),

    // Advanced operations
    getMergePersonsTool(client),
    getListPersonPermittedUsersTool(client),

    // Picture management
    getAddPersonPictureTool(client),
    getDeletePersonPictureTool(client),
  ];
}
