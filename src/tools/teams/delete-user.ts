import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';

const DeleteUserFromTeamArgsSchema = z.object({
  id: z.number().describe('ID of the team'),
  user_id: z.number().describe('ID of the user to remove from the team'),
});

export function createDeleteUserFromTeamTool(client: PipedriveClient) {
  return {
    name: 'teams_delete_user',
    description: 'Remove a user from a team.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ID of the team' },
        user_id: { type: 'number', description: 'ID of the user to remove from the team' },
      },
      required: ['id', 'user_id'],
    },
    handler: async (args: unknown) => {
      const parsed = DeleteUserFromTeamArgsSchema.parse(args);

      const response = await client.delete<PipedriveResponse<{ id: number }>>(
        `/legacyTeams/${parsed.id}/users/${parsed.user_id}`
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
