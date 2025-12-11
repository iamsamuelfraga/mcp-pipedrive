import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetPersonSchema } from '../../schemas/person.js';
import type { Person } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for getting a single person by ID
 */
export function getGetPersonTool(client: PipedriveClient) {
  return {
    name: 'persons/get',
    description: `Get detailed information about a specific person by ID.

Returns all person data including:
- Basic info (name, owner, organization)
- Contact details (emails, phones)
- Visibility and marketing status
- Activity counts (deals, activities, files, etc.)
- Timeline info (next activity, last activity)
- Custom fields`,
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
      const validated = GetPersonSchema.parse(params);

      const response = await client.get<PipedriveResponse<Person>>(
        `/persons/${validated.id}`,
        undefined,
        { enabled: true, ttl: 60000 } // Cache for 1 minute
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
