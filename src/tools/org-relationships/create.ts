import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';
import type { OrganizationRelationship } from '../../types/pipedrive-api.js';

const CreateOrganizationRelationshipArgsSchema = z.object({
  type: z.string().describe('The type of the relationship (e.g., parent, daughter, related)'),
  rel_owner_org_id: z.number().describe('The owner organization ID'),
  rel_linked_org_id: z.number().describe('The linked organization ID'),
  org_id: z.number().describe('The ID of the base organization for the returned calculated values'),
});

export function createCreateOrganizationRelationshipTool(client: PipedriveClient) {
  return {
    name: 'org-relationships/create',
    description: 'Create a new organization relationship.',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', description: 'The type of the relationship (e.g., parent, daughter, related)' },
        rel_owner_org_id: { type: 'number', description: 'The owner organization ID' },
        rel_linked_org_id: { type: 'number', description: 'The linked organization ID' },
        org_id: { type: 'number', description: 'The ID of the base organization for the returned calculated values' },
      },
      required: ['type', 'rel_owner_org_id', 'rel_linked_org_id', 'org_id'],
    },
    handler: async (args: unknown) => {
      const parsed = CreateOrganizationRelationshipArgsSchema.parse(args);

      const response = await client.post<PipedriveResponse<OrganizationRelationship>>(
        '/organizationRelationships',
        parsed
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
