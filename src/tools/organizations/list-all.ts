import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Organization } from '../../types/pipedrive-api.js';

const ListAllOrganizationsArgsSchema = z.object({
  user_id: z.number().optional().describe('Filter by user ID'),
  filter_id: z.number().optional().describe('Filter by filter ID'),
  first_char: z.string().optional().describe('Filter by first character of name'),
  max_items: z.number().optional().describe('Maximum number of items to fetch'),
});

export function createListAllOrganizationsTool(client: PipedriveClient) {
  return {
    name: 'organizations/list_all_auto',
    description:
      'Automatically fetch all organizations across all pages. Use this when you need complete data without manual pagination.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', description: 'Filter by user ID' },
        filter_id: { type: 'number', description: 'Filter by filter ID' },
        first_char: { type: 'string', description: 'Filter by first character of name' },
        max_items: { type: 'number', description: 'Maximum number of items to fetch' },
      },
    },
    handler: async (args: unknown) => {
      const parsed = ListAllOrganizationsArgsSchema.parse(args);

      const params: Record<string, string | number | boolean> = {};

      if (parsed.user_id !== undefined) params.user_id = parsed.user_id;
      if (parsed.filter_id !== undefined) params.filter_id = parsed.filter_id;
      if (parsed.first_char !== undefined) params.first_char = parsed.first_char;

      const paginator = client.createPaginator<Organization>('/organizations', params);
      const organizations = await paginator.fetchAll(100, parsed.max_items);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                data: organizations,
                count: organizations.length,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  };
}
