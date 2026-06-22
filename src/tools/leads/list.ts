import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListLeadsSchema } from '../../schemas/lead.js';
import { enrichEntityWithCustomFields } from '../../utils/custom-fields.js';

function applyDateFilter(
  response: unknown,
  addTimeFrom?: string,
  addTimeUntil?: string
): unknown {
  if (!addTimeFrom && !addTimeUntil) return response;
  const resp = response as { success?: boolean; data?: unknown; additional_data?: unknown };
  if (!resp.data || !Array.isArray(resp.data)) return response;

  const from = addTimeFrom ? new Date(addTimeFrom) : null;
  const until = addTimeUntil ? new Date(addTimeUntil + 'T23:59:59Z') : null;

  const filtered = resp.data.filter((item: unknown) => {
    const d = item as { add_time?: string };
    if (!d.add_time) return true;
    const t = new Date(d.add_time);
    if (from && t < from) return false;
    if (until && t > until) return false;
    return true;
  });

  return {
    ...resp,
    data: filtered,
    additional_data: { ...((resp.additional_data as object) ?? {}), total_count: filtered.length },
  };
}

export function getListLeadsTools(client: PipedriveClient) {
  return {
    leads_list: {
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
            description: 'Field names and sorting mode (e.g., "title ASC, value DESC")',
          },
          add_time_from: {
            type: 'string',
            description: 'Filter leads created on or after this date (YYYY-MM-DD). Applied client-side.',
          },
          add_time_until: {
            type: 'string',
            description: 'Filter leads created on or before this date (YYYY-MM-DD). Applied client-side.',
          },
          start: { type: 'number', description: 'Pagination start', default: 0 },
          limit: { type: 'number', description: 'Number of items to return', default: 100 },
        },
      },
      handler: async (args: unknown) => {
        const validated = ListLeadsSchema.parse(args);
        const { start, limit, add_time_from, add_time_until, ...filters } = validated;

        const response = await client.get<{ success: boolean; data?: unknown }>(
          '/leads',
          {
            ...filters,
            start: start ?? 0,
            limit: limit ?? 100,
          },
          { enabled: true, ttl: 300000 }
        );
        const enriched = await enrichEntityWithCustomFields(client, 'lead', response);
        return applyDateFilter(enriched, add_time_from, add_time_until);
      },
    },

    leads_list_all_auto: {
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
            description: 'Field names and sorting mode',
          },
          add_time_from: {
            type: 'string',
            description: 'Filter leads created on or after this date (YYYY-MM-DD). Applied client-side.',
          },
          add_time_until: {
            type: 'string',
            description: 'Filter leads created on or before this date (YYYY-MM-DD). Applied client-side.',
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

        const { max_items, add_time_from, add_time_until, ...filters } = validated;

        const paginator = client.createPaginator('/leads', filters);
        const allLeads = await paginator.fetchAll(100, max_items);

        const response = {
          success: true,
          data: allLeads,
          additional_data: { total_count: allLeads.length },
        };
        const enriched = await enrichEntityWithCustomFields(client, 'lead', response);
        return applyDateFilter(enriched, add_time_from, add_time_until);
      },
    },
  };
}
