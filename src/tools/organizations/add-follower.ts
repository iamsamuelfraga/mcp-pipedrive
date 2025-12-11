import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';

const AddOrganizationFollowerArgsSchema = z.object({
  id: z.number().describe('Organization ID'),
  user_id: z.number().describe('User ID to add as follower'),
});

export function createAddOrganizationFollowerTool(client: PipedriveClient) {
  return {
    name: 'organizations_add_follower',
    description: 'Add a follower to an organization.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Organization ID' },
        user_id: { type: 'number', description: 'User ID to add as follower' },
      },
      required: ['id', 'user_id'],
    },
    handler: async (args: unknown) => {
      const parsed = AddOrganizationFollowerArgsSchema.parse(args);

      const response = await client.post<PipedriveResponse<{ id: number; user_id: number }>>(
        `/organizations/${parsed.id}/followers`,
        {
          user_id: parsed.user_id,
        }
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
