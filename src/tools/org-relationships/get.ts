import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';
import type { OrganizationRelationship } from '../../types/pipedrive-api.js';

const GetOrganizationRelationshipArgsSchema = z.object({
  id: z.number().describe('ID of the organization relationship'),
});

export function createGetOrganizationRelationshipTool(client: PipedriveClient) {
  return {
    name: 'org-relationships/get',
    description: 'Get details of a specific organization relationship by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ID of the organization relationship' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = GetOrganizationRelationshipArgsSchema.parse(args);

      const response = await client.get<PipedriveResponse<OrganizationRelationship>>(
        `/organizationRelationships/${parsed.id}`,
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
