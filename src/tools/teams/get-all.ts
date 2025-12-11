import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';
import type { Team } from '../../types/pipedrive-api.js';

const GetAllTeamsArgsSchema = z.object({
  order_by: z.string().optional().describe('The field name to sort returned teams by'),
  skip_users: z
    .union([z.boolean(), z.number()])
    .optional()
    .describe('When enabled, the teams will not include IDs of member users'),
});

export function createGetAllTeamsTool(client: PipedriveClient) {
  return {
    name: 'teams_get_all',
    description: 'Get all teams within the company.',
    inputSchema: {
      type: 'object',
      properties: {
        order_by: { type: 'string', description: 'The field name to sort returned teams by' },
        skip_users: {
          type: ['boolean', 'number'],
          description: 'When enabled, the teams will not include IDs of member users',
        },
      },
    },
    handler: async (args: unknown) => {
      const parsed = GetAllTeamsArgsSchema.parse(args);

      const params: Record<string, string | boolean | number> = {};
      if (parsed.order_by !== undefined) {
        params.order_by = parsed.order_by;
      }
      if (parsed.skip_users !== undefined) {
        params.skip_users = parsed.skip_users;
      }

      const response = await client.get<PipedriveResponse<Team[]>>('/legacyTeams', params, {
        enabled: true,
        ttl: 60000,
      });

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
