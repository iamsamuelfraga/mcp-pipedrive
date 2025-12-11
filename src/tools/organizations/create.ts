import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Organization } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';

const CreateOrganizationArgsSchema = z.object({
  name: z.string().describe('Organization name (required)'),
  owner_id: z.number().optional().describe('ID of the user who will be the owner'),
  visible_to: z
    .enum(['1', '3', '5', '7'])
    .optional()
    .describe('Visibility: 1=Owner, 3=Company, 5=Followers, 7=Group'),
  add_time: z.string().optional().describe('Creation time (YYYY-MM-DD HH:MM:SS)'),
  // Address fields
  address: z.string().optional().describe('Full address'),
  address_street_number: z.string().optional().describe('Street number'),
  address_route: z.string().optional().describe('Street name'),
  address_locality: z.string().optional().describe('City'),
  address_country: z.string().optional().describe('Country'),
  address_postal_code: z.string().optional().describe('Postal code'),
  // Custom fields
  custom_fields: z.record(z.any()).optional().describe('Custom fields as key-value pairs'),
});

export function createCreateOrganizationTool(client: PipedriveClient) {
  return {
    name: 'organizations/create',
    description:
      'Create a new organization. Name is required. Supports address fields and custom fields.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Organization name (required)' },
        owner_id: { type: 'number', description: 'ID of the user who will be the owner' },
        visible_to: {
          type: 'string',
          enum: ['1', '3', '5', '7'],
          description:
            "Visibility: 1=Owner only, 3=Entire company, 5=Owner's followers, 7=Owner and visibility group",
        },
        add_time: { type: 'string', description: 'Creation time (YYYY-MM-DD HH:MM:SS)' },
        address: { type: 'string', description: 'Full address' },
        address_street_number: { type: 'string', description: 'Street number' },
        address_route: { type: 'string', description: 'Street name' },
        address_locality: { type: 'string', description: 'City' },
        address_country: { type: 'string', description: 'Country' },
        address_postal_code: { type: 'string', description: 'Postal code' },
        custom_fields: { type: 'object', description: 'Custom fields as key-value pairs' },
      },
      required: ['name'],
    },
    handler: async (args: unknown) => {
      const parsed = CreateOrganizationArgsSchema.parse(args);

      const body: Record<string, any> = {
        name: parsed.name,
      };

      if (parsed.owner_id !== undefined) body.owner_id = parsed.owner_id;
      if (parsed.visible_to !== undefined) body.visible_to = parsed.visible_to;
      if (parsed.add_time !== undefined) body.add_time = parsed.add_time;
      if (parsed.address !== undefined) body.address = parsed.address;
      if (parsed.address_street_number !== undefined)
        body.address_street_number = parsed.address_street_number;
      if (parsed.address_route !== undefined) body.address_route = parsed.address_route;
      if (parsed.address_locality !== undefined) body.address_locality = parsed.address_locality;
      if (parsed.address_country !== undefined) body.address_country = parsed.address_country;
      if (parsed.address_postal_code !== undefined)
        body.address_postal_code = parsed.address_postal_code;

      // Merge custom fields
      if (parsed.custom_fields) {
        Object.assign(body, parsed.custom_fields);
      }

      const response = await client.post<PipedriveResponse<Organization>>('/organizations', body);

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
