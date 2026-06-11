import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Organization } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';
import { resolveCustomFieldsForEntity } from '../../utils/custom-fields.js';
import { CreateOrganizationSchema } from '../../schemas/organization.js';

export function createCreateOrganizationTool(client: PipedriveClient) {
  return {
    name: 'organizations_create',
    description:
      'Create a new organization. Name is required. Supports address fields and custom fields.\n\nCustom fields:\n- Pass display names: { "custom_fields": { "Industry": "Tech", "Tier": "Gold" } }\n- Or hash keys directly: { "custom_fields": { "abc123...": "raw value" } }\n- For enum/set fields, pass option labels (not ids).',
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
        label: { type: 'number', description: 'ID of the label to assign to the organization' },
        address: { type: 'string', description: 'Street address' },
        address_subpremise: { type: 'string', description: 'Apartment/suite number' },
        address_street_number: { type: 'string', description: 'Street number' },
        address_route: { type: 'string', description: 'Street name' },
        address_sublocality: { type: 'string', description: 'District/sublocality' },
        address_locality: { type: 'string', description: 'City' },
        address_admin_area_level_1: { type: 'string', description: 'State/province' },
        address_admin_area_level_2: { type: 'string', description: 'County/region' },
        address_country: { type: 'string', description: 'Country' },
        address_postal_code: { type: 'string', description: 'Postal code' },
        address_formatted_address: { type: 'string', description: 'Full formatted address' },
        custom_fields: {
          type: 'object',
          description:
            'Custom field values keyed by display name or hash. e.g. { "Industry": "Tech" }',
          additionalProperties: true,
        },
      },
      required: ['name'],
    },
    handler: async (args: unknown) => {
      const parsed = CreateOrganizationSchema.parse(args);

      const body: Record<string, unknown> = {
        name: parsed.name,
      };

      if (parsed.owner_id !== undefined) body.owner_id = parsed.owner_id;
      if (parsed.visible_to !== undefined) body.visible_to = parsed.visible_to;
      if (parsed.add_time !== undefined) body.add_time = parsed.add_time;
      if (parsed.label !== undefined) body.label = parsed.label;
      if (parsed.address !== undefined) body.address = parsed.address;
      if (parsed.address_subpremise !== undefined)
        body.address_subpremise = parsed.address_subpremise;
      if (parsed.address_street_number !== undefined)
        body.address_street_number = parsed.address_street_number;
      if (parsed.address_route !== undefined) body.address_route = parsed.address_route;
      if (parsed.address_sublocality !== undefined)
        body.address_sublocality = parsed.address_sublocality;
      if (parsed.address_locality !== undefined) body.address_locality = parsed.address_locality;
      if (parsed.address_admin_area_level_1 !== undefined)
        body.address_admin_area_level_1 = parsed.address_admin_area_level_1;
      if (parsed.address_admin_area_level_2 !== undefined)
        body.address_admin_area_level_2 = parsed.address_admin_area_level_2;
      if (parsed.address_country !== undefined) body.address_country = parsed.address_country;
      if (parsed.address_postal_code !== undefined)
        body.address_postal_code = parsed.address_postal_code;
      if (parsed.address_formatted_address !== undefined)
        body.address_formatted_address = parsed.address_formatted_address;

      // Resolve custom field names to hash keys and merge into body.
      const resolved = await resolveCustomFieldsForEntity(
        client,
        'organization',
        parsed.custom_fields
      );
      Object.assign(body, resolved);

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
