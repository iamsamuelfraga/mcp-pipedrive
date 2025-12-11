import type { PipedriveClient } from '../../pipedrive-client.js';
import { createGetOrganizationRelationshipsTool } from './get-all.js';
import { createGetOrganizationRelationshipTool } from './get.js';
import { createCreateOrganizationRelationshipTool } from './create.js';
import { createUpdateOrganizationRelationshipTool } from './update.js';
import { createDeleteOrganizationRelationshipTool } from './delete.js';

export function getOrganizationRelationshipsTools(client: PipedriveClient) {
  return [
    createGetOrganizationRelationshipsTool(client),
    createGetOrganizationRelationshipTool(client),
    createCreateOrganizationRelationshipTool(client),
    createUpdateOrganizationRelationshipTool(client),
    createDeleteOrganizationRelationshipTool(client),
  ];
}
