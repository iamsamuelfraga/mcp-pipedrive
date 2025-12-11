import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';

const DeleteOrganizationArgsSchema = z.object({
  id: z.number().describe('Organization ID'),
});

export function createDeleteOrganizationTool(client: PipedriveClient) {
  return {
    name: 'organizations/delete',
    description: 'Delete an organization by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Organization ID' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = DeleteOrganizationArgsSchema.parse(args);

      const response = await client.delete<PipedriveResponse<{ id: number }>>(
        `/organizations/${parsed.id}`
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
