import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListFilesSchema } from '../../schemas/file.js';

export function getListFilesTool(client: PipedriveClient) {
  return {
    'files/list': {
      description: `List files with pagination and filtering options.

Returns a paginated list of files. Use filters to narrow results by associated entity (deal, person, organization, activity, product).

Workflow tips:
- Filter by entity to get files for specific deals, persons, organizations, etc.
- Use sort to order by add_time, update_time, file_name, or file_size
- Set include_deleted_files=true to see deleted files
- Use start/limit for pagination (default limit: 100, max: 500)
- Combine multiple filters to narrow results

Common use cases:
- List all files for a deal: { "deal_id": 123 }
- List all files for a person: { "person_id": 456 }
- List all files for an organization: { "org_id": 789 }
- List recent files sorted by upload time: { "sort": "add_time", "sort_by": "desc" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          deal_id: { type: 'number', description: 'Filter by deal ID' },
          person_id: { type: 'number', description: 'Filter by person ID' },
          org_id: { type: 'number', description: 'Filter by organization ID' },
          activity_id: { type: 'number', description: 'Filter by activity ID' },
          product_id: { type: 'number', description: 'Filter by product ID' },
          include_deleted_files: {
            type: 'boolean',
            description: 'Whether to include deleted files (default: false)',
          },
          sort: {
            type: 'string',
            description: 'Field to sort by (e.g., add_time, update_time, file_name, file_size)',
          },
          sort_by: {
            type: 'string',
            enum: ['asc', 'desc'],
            description: 'Sort direction',
          },
          start: { type: 'number', description: 'Pagination start', default: 0 },
          limit: { type: 'number', description: 'Number of items to return', default: 100 },
        },
      },
      handler: async (args: unknown) => {
        const validated = ListFilesSchema.parse(args);
        const { start, limit, ...filters } = validated;

        return client.get(
          '/files',
          {
            ...filters,
            start: start ?? 0,
            limit: limit ?? 100,
          },
          { enabled: true, ttl: 300000 } // Cache for 5 minutes
        );
      },
    },
  };
}
