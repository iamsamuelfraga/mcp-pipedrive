import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { PipedriveResponse } from '../../types/common.js';
import type { OrganizationRelationship } from '../../types/pipedrive-api.js';

const UpdateOrganizationRelationshipArgsSchema = z.object({
  id: z.number().describe('ID of the organization relationship to update'),
  type: z
    .string()
    .optional()
    .describe('The type of the relationship (e.g., parent, daughter, related)'),
  rel_owner_org_id: z.number().optional().describe('The owner organization ID'),
  rel_linked_org_id: z.number().optional().describe('The linked organization ID'),
  org_id: z
    .number()
    .optional()
    .describe('The ID of the base organization for the returned calculated values'),
});

export function createUpdateOrganizationRelationshipTool(client: PipedriveClient) {
  return {
    name: 'org_relationships_update',
    description: 'Update the properties of an organization relationship.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ID of the organization relationship to update' },
        type: {
          type: 'string',
          description: 'The type of the relationship (e.g., parent, daughter, related)',
        },
        rel_owner_org_id: { type: 'number', description: 'The owner organization ID' },
        rel_linked_org_id: { type: 'number', description: 'The linked organization ID' },
        org_id: {
          type: 'number',
          description: 'The ID of the base organization for the returned calculated values',
        },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = UpdateOrganizationRelationshipArgsSchema.parse(args);
      const { id, ...updateData } = parsed;

      const response = await client.put<PipedriveResponse<OrganizationRelationship>>(
        `/organizationRelationships/${id}`,
        updateData
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
