import type { PipedriveClient } from '../../pipedrive-client.js';
import { CreatePersonSchema } from '../../schemas/person.js';
import type { Person } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for creating a new person
 */
export function getCreatePersonTool(client: PipedriveClient) {
  return {
    name: 'persons_create',
    description: `Create a new person in Pipedrive.

Required fields:
- name: Full name of the person

Optional fields:
- owner_id: User who will own this person
- org_id: Organization this person belongs to
- email: Array of email addresses with format: [{"value": "john@company.com", "primary": true, "label": "work"}]
- phone: Array of phone numbers with format: [{"value": "+1234567890", "primary": true, "label": "mobile"}]
- visible_to: Visibility level (1=owner only, 3=entire company, 5=owner's followers, 7=visibility group)
- marketing_status: Marketing consent status (no_consent, unsubscribed, subscribed, archived)
- add_time: Optional creation time in YYYY-MM-DD HH:MM:SS format

Example email/phone arrays:
{
  "email": [
    {"value": "john@company.com", "primary": true, "label": "work"},
    {"value": "john@personal.com", "primary": false, "label": "home"}
  ],
  "phone": [
    {"value": "+1234567890", "primary": true, "label": "mobile"}
  ]
}`,
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Full name of the person (required)',
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
            'Email addresses array. Example: [{"value": "john@company.com", "primary": true, "label": "work"}]',
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
            'Phone numbers array. Example: [{"value": "+1234567890", "primary": true, "label": "mobile"}]',
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
        add_time: {
          type: 'string',
          description: 'Creation time in YYYY-MM-DD HH:MM:SS format',
        },
      },
      required: ['name'],
    } as const,
    handler: async (params: unknown) => {
      const validated = CreatePersonSchema.parse(params);

      const body: Record<string, unknown> = {
        name: validated.name,
      };

      if (validated.owner_id) body.owner_id = validated.owner_id;
      if (validated.org_id) body.org_id = validated.org_id;
      if (validated.email) body.email = validated.email;
      if (validated.phone) body.phone = validated.phone;
      if (validated.visible_to) body.visible_to = validated.visible_to;
      if (validated.marketing_status) body.marketing_status = validated.marketing_status;
      if (validated.add_time) body.add_time = validated.add_time;

      const response = await client.post<PipedriveResponse<Person>>('/persons', body);

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
