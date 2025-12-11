import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';
import type { Team } from '../../types/pipedrive-api.js';

const GetTeamArgsSchema = z.object({
  id: z.number().describe('ID of the team'),
  skip_users: z
    .union([z.boolean(), z.number()])
    .optional()
    .describe('When enabled, the team will not include IDs of member users'),
});

export function createGetTeamTool(client: PipedriveClient) {
  return {
    name: 'teams/get',
    description: 'Get details of a specific team by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ID of the team' },
        skip_users: {
          type: ['boolean', 'number'],
          description: 'When enabled, the team will not include IDs of member users',
        },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = GetTeamArgsSchema.parse(args);

      const params: Record<string, boolean | number> = {};
      if (parsed.skip_users !== undefined) {
        params.skip_users = parsed.skip_users;
      }

      const response = await client.get<PipedriveResponse<Team>>(
        `/legacyTeams/${parsed.id}`,
        params,
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
