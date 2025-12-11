import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';
import type { User } from '../../types/pipedrive-api.js';

const AddUserToTeamArgsSchema = z.object({
  id: z.number().describe('ID of the team'),
  user_id: z.number().describe('ID of the user to add to the team'),
});

export function createAddUserToTeamTool(client: PipedriveClient) {
  return {
    name: 'teams_add_user',
    description: 'Add a user to a team.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ID of the team' },
        user_id: { type: 'number', description: 'ID of the user to add to the team' },
      },
      required: ['id', 'user_id'],
    },
    handler: async (args: unknown) => {
      const parsed = AddUserToTeamArgsSchema.parse(args);

      const response = await client.post<PipedriveResponse<User>>(
        `/legacyTeams/${parsed.id}/users`,
        { user_id: parsed.user_id }
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    },
  };
}
