import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';

const DeleteOrganizationRelationshipArgsSchema = z.object({
  id: z.number().describe('ID of the organization relationship to delete'),
});

export function createDeleteOrganizationRelationshipTool(client: PipedriveClient) {
  return {
    name: 'org_relationships_delete',
    description: 'Delete an organization relationship.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ID of the organization relationship to delete' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = DeleteOrganizationRelationshipArgsSchema.parse(args);

      const response = await client.delete<PipedriveResponse<{ id: number }>>(
        `/organizationRelationships/${parsed.id}`
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
