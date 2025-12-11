import type { PipedriveClient } from '../../pipedrive-client.js';
import { createListOrganizationsTool } from './list.js';
import { createListAllOrganizationsTool } from './list-all.js';
import { createCreateOrganizationTool } from './create.js';
import { createGetOrganizationTool } from './get.js';
import { createUpdateOrganizationTool } from './update.js';
import { createDeleteOrganizationTool } from './delete.js';
import { createSearchOrganizationsTool } from './search.js';
import { createListOrganizationPersonsTool } from './persons.js';
import { createListOrganizationDealsTool } from './deals.js';
import { createListOrganizationActivitiesTool } from './activities.js';
import { createListOrganizationFilesTool } from './files.js';
import { createAddOrganizationFollowerTool } from './add-follower.js';
import { getBulkDeleteOrganizationsTool } from './bulk.js';
import { getOrganizationsCollectionTool } from './collection.js';
import { getListOrganizationChangelogTool, getListOrganizationFlowTool } from './updates.js';
import { getDeleteOrganizationFollowerTool } from './follower-actions.js';
import { getListOrganizationMailMessagesTool } from './mail.js';
import { getMergeOrganizationsTool } from './merge.js';
import { getListOrganizationPermittedUsersTool } from './permissions.js';

export function getOrganizationTools(client: PipedriveClient) {
  return [
    createListOrganizationsTool(client),
    createListAllOrganizationsTool(client),
    createCreateOrganizationTool(client),
    createGetOrganizationTool(client),
    createUpdateOrganizationTool(client),
    createDeleteOrganizationTool(client),
    createSearchOrganizationsTool(client),
    createListOrganizationPersonsTool(client),
    createListOrganizationDealsTool(client),
    createListOrganizationActivitiesTool(client),
    createListOrganizationFilesTool(client),
    createAddOrganizationFollowerTool(client),
    getBulkDeleteOrganizationsTool(client),
    getOrganizationsCollectionTool(client),
    getListOrganizationChangelogTool(client),
    getListOrganizationFlowTool(client),
    getDeleteOrganizationFollowerTool(client),
    getListOrganizationMailMessagesTool(client),
    getMergeOrganizationsTool(client),
    getListOrganizationPermittedUsersTool(client),
  ];
}
