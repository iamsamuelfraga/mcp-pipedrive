import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListArchivedLeadsSchema } from '../../schemas/lead.js';

export function getListArchivedLeadsTool(client: PipedriveClient) {
  return {
    'leads_list_archived': {
      description: `List archived leads with pagination and filtering options.

Returns a paginated list of archived leads. Archived leads are leads that have been
moved out of the active Leads Inbox but not deleted or converted to deals.

Workflow tips:
- Archived leads are sorted by creation time (oldest to newest)
- Use owner_id to filter by lead owner
- Use person_id or organization_id to filter by associated entities
- filter_id takes precedence over other filters
- Use start/limit for pagination (default limit: 100, max: 500)
- Archived leads can be restored to active status using leads/update

Common use cases:
- List all archived leads: {}
- List archived leads for a specific owner: { "owner_id": 123 }
- List archived leads for a person: { "person_id": 456 }
- Review archived leads before deletion: { "limit": 50 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          owner_id: { type: 'number', description: 'Filter by owner (user) ID' },
          person_id: { type: 'number', description: 'Filter by person ID' },
          organization_id: { type: 'number', description: 'Filter by organization ID' },
          filter_id: { type: 'number', description: 'ID of the filter to use' },
          sort: {
            type: 'string',
            description: 'Field names and sorting mode (e.g., "title ASC, value DESC")',
          },
          start: { type: 'number', description: 'Pagination start', default: 0 },
          limit: { type: 'number', description: 'Number of items to return', default: 100 },
        },
      },
      handler: async (args: unknown) => {
        const validated = ListArchivedLeadsSchema.parse(args);
        const { start, limit, ...filters } = validated;

        return client.get(
          '/leads/archived',
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
