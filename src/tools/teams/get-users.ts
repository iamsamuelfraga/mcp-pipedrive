import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';
import type { User } from '../../types/pipedrive-api.js';

const GetTeamUsersArgsSchema = z.object({
  id: z.number().describe('ID of the team'),
});

export function createGetTeamUsersTool(client: PipedriveClient) {
  return {
    name: 'teams_get_users',
    description: 'Get all users in a team.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ID of the team' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = GetTeamUsersArgsSchema.parse(args);

      const response = await client.get<PipedriveResponse<User[]>>(
        `/legacyTeams/${parsed.id}/users`,
        {},
        { enabled: true, ttl: 60000 }
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
