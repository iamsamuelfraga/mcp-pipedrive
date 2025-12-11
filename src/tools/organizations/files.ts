import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { File } from '../../types/pipedrive-api.js';
import type { PaginatedResponse } from '../../utils/pagination.js';

const ListOrganizationFilesArgsSchema = z.object({
  id: z.number().describe('Organization ID'),
  start: z.number().default(0).describe('Pagination start'),
  limit: z.number().default(100).describe('Items per page'),
  sort: z.string().optional().describe('Field to sort by'),
});

export function createListOrganizationFilesTool(client: PipedriveClient) {
  return {
    name: 'organizations_list_files',
    description: 'List all files attached to a specific organization.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Organization ID' },
        start: { type: 'number', description: 'Pagination start', default: 0 },
        limit: { type: 'number', description: 'Items per page', default: 100 },
        sort: { type: 'string', description: 'Field to sort by' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = ListOrganizationFilesArgsSchema.parse(args);

      const params: Record<string, string | number | boolean> = {
        start: parsed.start,
        limit: parsed.limit,
      };

      if (parsed.sort !== undefined) params.sort = parsed.sort;

      const response = await client.get<PaginatedResponse<File>>(
        `/organizations/${parsed.id}/files`,
        params,
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
