import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Person } from '../../types/pipedrive-api.js';
import type { PaginatedResponse } from '../../utils/pagination.js';

const ListOrganizationPersonsArgsSchema = z.object({
  id: z.number().describe('Organization ID'),
  start: z.number().default(0).describe('Pagination start'),
  limit: z.number().default(100).describe('Items per page'),
});

export function createListOrganizationPersonsTool(client: PipedriveClient) {
  return {
    name: 'organizations_list_persons',
    description: 'List all persons associated with a specific organization.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Organization ID' },
        start: { type: 'number', description: 'Pagination start', default: 0 },
        limit: { type: 'number', description: 'Items per page', default: 100 },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = ListOrganizationPersonsArgsSchema.parse(args);

      const response = await client.get<PaginatedResponse<Person>>(
        `/organizations/${parsed.id}/persons`,
        {
          start: parsed.start,
          limit: parsed.limit,
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
