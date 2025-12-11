import type { PipedriveClient } from '../../pipedrive-client.js';
import { UpdatePersonSchema } from '../../schemas/person.js';
import type { Person } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for updating an existing person
 */
export function getUpdatePersonTool(client: PipedriveClient) {
  return {
    name: 'persons/update',
    description: `Update an existing person's information.

Required fields:
- id: Person ID to update

Optional fields (only provide fields you want to change):
- name: Full name
- owner_id: User who will own this person
- org_id: Organization this person belongs to
- email: Array of email addresses with format: [{"value": "john@company.com", "primary": true, "label": "work"}]
- phone: Array of phone numbers with format: [{"value": "+1234567890", "primary": true, "label": "mobile"}]
- visible_to: Visibility level (1=owner only, 3=entire company, 5=owner's followers, 7=visibility group)
- marketing_status: Marketing consent status (no_consent, unsubscribed, subscribed, archived)

Note: When updating email/phone arrays, provide the complete array (it replaces the existing one).`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Person ID to update',
        },
        name: {
          type: 'string',
          description: 'Full name of the person',
        },
        owner_id: {
          type: 'number',
          description: 'ID of the user who will own this person',
        },
        org_id: {
          type: 'number',
          description: 'ID of the organization this person belongs to',
        },
        email: {
          type: 'array',
          description:
            'Email addresses array (replaces existing). Example: [{"value": "john@company.com", "primary": true, "label": "work"}]',
          items: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                description: 'Email address',
              },
              primary: {
                type: 'boolean',
                description: 'Is this the primary email?',
              },
              label: {
                type: 'string',
                description: 'Label (work, home, other)',
              },
            },
            required: ['value'],
          },
        },
        phone: {
          type: 'array',
          description:
            'Phone numbers array (replaces existing). Example: [{"value": "+1234567890", "primary": true, "label": "mobile"}]',
          items: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                description: 'Phone number',
              },
              primary: {
                type: 'boolean',
                description: 'Is this the primary phone?',
              },
              label: {
                type: 'string',
                description: 'Label (work, mobile, home)',
              },
            },
            required: ['value'],
          },
        },
        visible_to: {
          type: 'string',
          description:
            "Visibility: 1 (owner only), 3 (entire company), 5 (owner's followers), 7 (visibility group)",
          enum: ['1', '3', '5', '7'],
        },
        marketing_status: {
          type: 'string',
          description: 'Marketing consent status',
          enum: ['no_consent', 'unsubscribed', 'subscribed', 'archived'],
        },
      },
      required: ['id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = UpdatePersonSchema.parse(params);

      const body: Record<string, unknown> = {};

      if (validated.name !== undefined) body.name = validated.name;
      if (validated.owner_id !== undefined) body.owner_id = validated.owner_id;
      if (validated.org_id !== undefined) body.org_id = validated.org_id;
      if (validated.email !== undefined) body.email = validated.email;
      if (validated.phone !== undefined) body.phone = validated.phone;
      if (validated.visible_to !== undefined) body.visible_to = validated.visible_to;
      if (validated.marketing_status !== undefined)
        body.marketing_status = validated.marketing_status;

      const response = await client.put<PipedriveResponse<Person>>(
        `/persons/${validated.id}`,
        body
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
