import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';
import type { Team } from '../../types/pipedrive-api.js';

const UpdateTeamArgsSchema = z.object({
  id: z.number().describe('ID of the team to update'),
  name: z.string().optional().describe('Team name'),
  manager_id: z.number().optional().describe('ID of the user who will be the manager of this team'),
  description: z.string().optional().describe('Team description'),
  users: z.array(z.number()).optional().describe('Array of user IDs to add to the team'),
  active_flag: z.union([z.boolean(), z.number()]).optional().describe('Whether the team is active'),
});

export function createUpdateTeamTool(client: PipedriveClient) {
  return {
    name: 'teams_update',
    description: 'Update the properties of a team.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ID of the team to update' },
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
        active_flag: { type: ['boolean', 'number'], description: 'Whether the team is active' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = UpdateTeamArgsSchema.parse(args);
      const { id, ...updateData } = parsed;

      const response = await client.put<PipedriveResponse<Team>>(`/legacyTeams/${id}`, updateData);

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
