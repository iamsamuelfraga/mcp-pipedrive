import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetPersonPermittedUsersSchema } from '../../schemas/person.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for listing permitted users for a person
 */
export function getListPersonPermittedUsersTool(client: PipedriveClient) {
  return {
    name: 'persons_list_permitted_users',
    description: `List users permitted to access a person.

Returns a list of all users who have permission to view and/or edit this person record.
This is determined by:
- The person's visibility settings
- User roles and permissions
- Team assignments
- Sharing rules

Each entry includes:
- User ID
- User name and email
- Access level (view/edit)
- Permission source

This is useful for:
- Security auditing
- Access management
- Understanding data visibility
- Compliance and governance
- Team coordination

Note: Results depend on the visibility settings of the person (e.g., owner only,
owner's team, everyone, etc.).`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Person ID',
        },
      },
      required: ['id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = GetPersonPermittedUsersSchema.parse(params);

      const response = await client.get<PipedriveResponse<unknown[]>>(
        `/persons/${validated.id}/permittedUsers`,
        undefined,
        { enabled: true, ttl: 300000 } // Cache for 5 minutes
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
