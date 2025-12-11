import type { PipedriveClient } from '../../pipedrive-client.js';
import { createGetAllTeamsTool } from './get-all.js';
import { createGetTeamTool } from './get.js';
import { createCreateTeamTool } from './create.js';
import { createUpdateTeamTool } from './update.js';
import { createGetTeamUsersTool } from './get-users.js';
import { createAddUserToTeamTool } from './add-user.js';
import { createDeleteUserFromTeamTool } from './delete-user.js';
import { createGetUserTeamsTool } from './get-user-teams.js';

export function getTeamsTools(client: PipedriveClient) {
  return [
    createGetAllTeamsTool(client),
    createGetTeamTool(client),
    createCreateTeamTool(client),
    createUpdateTeamTool(client),
    createGetTeamUsersTool(client),
    createAddUserToTeamTool(client),
    createDeleteUserFromTeamTool(client),
    createGetUserTeamsTool(client),
  ];
}
