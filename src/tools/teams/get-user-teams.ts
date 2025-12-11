import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';
import type { Team } from '../../types/pipedrive-api.js';

const GetUserTeamsArgsSchema = z.object({
  id: z.number().describe('ID of the user'),
  order_by: z.string().optional().describe('The field name to sort returned teams by'),
  skip_users: z.union([z.boolean(), z.number()]).optional().describe('When enabled, the teams will not include IDs of member users'),
});

export function createGetUserTeamsTool(client: PipedriveClient) {
  return {
    name: 'teams/get-user-teams',
    description: 'Get all teams that a specific user belongs to.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ID of the user' },
        order_by: { type: 'string', description: 'The field name to sort returned teams by' },
        skip_users: { type: ['boolean', 'number'], description: 'When enabled, the teams will not include IDs of member users' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = GetUserTeamsArgsSchema.parse(args);

      const params: Record<string, string | boolean | number> = {};
      if (parsed.order_by !== undefined) {
        params.order_by = parsed.order_by;
      }
      if (parsed.skip_users !== undefined) {
        params.skip_users = parsed.skip_users;
      }

      const response = await client.get<PipedriveResponse<Team[]>>(
        `/users/${parsed.id}/teams`,
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
