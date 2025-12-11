import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListLeadsSchema } from '../../schemas/lead.js';

export function getListLeadsTools(client: PipedriveClient) {
  return {
    'leads/list': {
      description: `List leads with pagination and filtering options.

Returns a paginated list of non-archived leads. Use filters to narrow results by owner, person, or organization.

Workflow tips:
- Leads are sorted by creation time (oldest to newest)
- Use owner_id to filter by lead owner
- Use person_id or organization_id to filter by associated entities
- filter_id takes precedence over other filters
- Use start/limit for pagination (default limit: 100, max: 500)
- For all leads without pagination, use leads/list_all_auto instead
- Leads inherit custom fields structure from deals

Common use cases:
- List all leads: {}
- List leads for a specific owner: { "owner_id": 123 }
- List leads for a person: { "person_id": 456 }
- List leads for an organization: { "organization_id": 789 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          owner_id: { type: 'number', description: 'Filter by owner (user) ID' },
          person_id: { type: 'number', description: 'Filter by person ID' },
          organization_id: { type: 'number', description: 'Filter by organization ID' },
          filter_id: { type: 'number', description: 'ID of the filter to use' },
          sort: {
            type: 'string',
            description: 'Field names and sorting mode (e.g., "title ASC, value DESC")'
          },
          start: { type: 'number', description: 'Pagination start', default: 0 },
          limit: { type: 'number', description: 'Number of items to return', default: 100 },
        },
      },
      handler: async (args: unknown) => {
        const validated = ListLeadsSchema.parse(args);
        const { start, limit, ...filters } = validated;

        return client.get(
          '/leads',
          {
            ...filters,
            start: start ?? 0,
            limit: limit ?? 100,
          },
          { enabled: true, ttl: 300000 } // Cache for 5 minutes
        );
      },
    },

    'leads/list_all_auto': {
      description: `Automatically fetch ALL leads with pagination handling.

This tool automatically handles pagination and fetches all non-archived leads matching the filters.
Unlike leads/list, this returns ALL results in a single response.

WARNING: This can return large datasets. Use filters to limit results.

Workflow tips:
- Same filters as leads/list (owner_id, person_id, organization_id, filter_id)
- Specify max_items to limit total results if needed
- No need to manage start/limit - pagination is automatic
- Best for exports, reports, or comprehensive analysis
- Leads are sorted by creation time (oldest to newest)

Common use cases:
- Get all leads: {}
- Export all leads for a user: { "owner_id": 123 }
- Get all leads for analysis: { "max_items": 1000 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          owner_id: { type: 'number', description: 'Filter by owner (user) ID' },
          person_id: { type: 'number', description: 'Filter by person ID' },
          organization_id: { type: 'number', description: 'Filter by organization ID' },
          filter_id: { type: 'number', description: 'ID of the filter to use' },
          sort: {
            type: 'string',
            description: 'Field names and sorting mode'
          },
          max_items: { type: 'number', description: 'Maximum number of items to return' },
        },
      },
      handler: async (args: unknown) => {
        const validated = ListLeadsSchema.omit({ start: true, limit: true })
          .extend({
            max_items: ListLeadsSchema.shape.limit.optional(),
          })
          .parse(args);

        const { max_items, ...filters } = validated;

        const paginator = client.createPaginator('/leads', filters);
        const allLeads = await paginator.fetchAll(100, max_items);

        return {
          success: true,
          data: allLeads,
          additional_data: {
            total_count: allLeads.length,
          },
        };
      },
    },
  };
}
