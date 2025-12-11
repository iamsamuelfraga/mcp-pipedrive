import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';
import type { OrganizationRelationship } from '../../types/pipedrive-api.js';

const GetOrganizationRelationshipsArgsSchema = z.object({
  org_id: z.number().describe('The ID of the organization to get relationships for'),
});

export function createGetOrganizationRelationshipsTool(client: PipedriveClient) {
  return {
    name: 'org-relationships/get-all',
    description: 'Get all relationships for a specific organization.',
    inputSchema: {
      type: 'object',
      properties: {
        org_id: { type: 'number', description: 'The ID of the organization to get relationships for' },
      },
      required: ['org_id'],
    },
    handler: async (args: unknown) => {
      const parsed = GetOrganizationRelationshipsArgsSchema.parse(args);

      const response = await client.get<PipedriveResponse<OrganizationRelationship[]>>(
        '/organizationRelationships',
        {
          org_id: parsed.org_id,
        },
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
