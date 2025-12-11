import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';
import type { Team } from '../../types/pipedrive-api.js';

const CreateTeamArgsSchema = z.object({
  name: z.string().describe('Team name'),
  manager_id: z.number().describe('ID of the user who will be the manager of this team'),
  description: z.string().optional().describe('Team description'),
  users: z.array(z.number()).optional().describe('Array of user IDs to add to the team'),
});

export function createCreateTeamTool(client: PipedriveClient) {
  return {
    name: 'teams_create',
    description: 'Add a new team to the company.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Team name' },
        manager_id: {
          type: 'number',
          description: 'ID of the user who will be the manager of this team',
        },
        description: { type: 'string', description: 'Team description' },
        users: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of user IDs to add to the team',
        },
      },
      required: ['name', 'manager_id'],
    },
    handler: async (args: unknown) => {
      const parsed = CreateTeamArgsSchema.parse(args);

      const response = await client.post<PipedriveResponse<Team>>('/legacyTeams', parsed);

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
