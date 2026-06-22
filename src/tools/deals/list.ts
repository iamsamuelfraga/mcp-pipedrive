import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListDealsSchema } from '../../schemas/deal.js';
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
  // add_time_until is inclusive — extend to end of day
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

export function getListDealsTools(client: PipedriveClient) {
  return {
    deals_list: {
      description: `List deals with pagination and filtering options.

Returns a paginated list of deals. Use filters to narrow results by status, stage, owner, person, organization, or pipeline.

Workflow tips:
- Use status filter to get only 'open', 'won', 'lost', or 'all_not_deleted' deals
- Set owned_by_you=1 to see only your deals
- Combine with filter_id to use pre-configured Pipedrive filters
- Use start/limit for pagination (default limit: 100, max: 500)
- For all deals without pagination, use deals/list_all_auto instead
- Use add_time_from / add_time_until to filter by creation date (client-side)

Common use cases:
- List all open deals: { "status": "open" }
- List my won deals: { "status": "won", "owned_by_you": 1 }
- List deals in a specific stage: { "stage_id": 123 }
- List deals added before 2023: { "add_time_until": "2022-12-31" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          status: {
            type: 'string',
            enum: ['open', 'won', 'lost', 'deleted', 'all_not_deleted'],
            description: 'Filter by deal status',
          },
          stage_id: { type: 'number', description: 'Filter by stage ID' },
          user_id: { type: 'number', description: 'Filter by user (owner) ID' },
          person_id: { type: 'number', description: 'Filter by person ID' },
          org_id: { type: 'number', description: 'Filter by organization ID' },
          pipeline_id: { type: 'number', description: 'Filter by pipeline ID' },
          filter_id: { type: 'number', description: 'ID of the filter to use' },
          sort: { type: 'string', description: 'Field to sort by (e.g., title, value, stage_id)' },
          sort_by: {
            type: 'string',
            enum: ['asc', 'desc'],
            description: 'Sort direction',
          },
          owned_by_you: {
            type: 'number',
            enum: [0, 1],
            description: 'Filter deals owned by the authorized user (1 = yes, 0 = no)',
          },
          add_time_from: {
            type: 'string',
            description: 'Filter deals created on or after this date (YYYY-MM-DD). Applied client-side.',
          },
          add_time_until: {
            type: 'string',
            description: 'Filter deals created on or before this date (YYYY-MM-DD). Applied client-side.',
          },
          start: { type: 'number', description: 'Pagination start', default: 0 },
          limit: { type: 'number', description: 'Number of items to return', default: 100 },
        },
      },
      handler: async (args: unknown) => {
        const validated = ListDealsSchema.parse(args);
        const { start, limit, add_time_from, add_time_until, ...filters } = validated;

        const response = await client.get<{ success: boolean; data?: unknown }>(
          '/deals',
          {
            ...filters,
            start: start ?? 0,
            limit: limit ?? 100,
          },
          { enabled: true, ttl: 300000 }
        );
        const enriched = await enrichEntityWithCustomFields(client, 'deal', response);
        return applyDateFilter(enriched, add_time_from, add_time_until);
      },
    },

    deals_list_all_auto: {
      description: `Automatically fetch ALL deals with pagination handling.

This tool automatically handles pagination and fetches all deals matching the filters.
Unlike deals/list, this returns ALL results in a single response.

WARNING: This can return large datasets. Use filters to limit results.

Workflow tips:
- Same filters as deals/list (status, stage_id, user_id, person_id, org_id, etc.)
- Specify max_items to limit total results if needed
- No need to manage start/limit - pagination is automatic
- Best for exports, reports, or comprehensive analysis
- Use add_time_from / add_time_until to filter by creation date (client-side)

Common use cases:
- Get all open deals: { "status": "open" }
- Export all deals for a pipeline: { "pipeline_id": 1 }
- Get old unqualified deals: { "pipeline_id": 4, "add_time_until": "2023-12-31" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          status: {
            type: 'string',
            enum: ['open', 'won', 'lost', 'deleted', 'all_not_deleted'],
            description: 'Filter by deal status',
          },
          stage_id: { type: 'number', description: 'Filter by stage ID' },
          user_id: { type: 'number', description: 'Filter by user (owner) ID' },
          person_id: { type: 'number', description: 'Filter by person ID' },
          org_id: { type: 'number', description: 'Filter by organization ID' },
          pipeline_id: { type: 'number', description: 'Filter by pipeline ID' },
          filter_id: { type: 'number', description: 'ID of the filter to use' },
          sort: { type: 'string', description: 'Field to sort by' },
          sort_by: {
            type: 'string',
            enum: ['asc', 'desc'],
            description: 'Sort direction',
          },
          owned_by_you: {
            type: 'number',
            enum: [0, 1],
            description: 'Filter deals owned by the authorized user',
          },
          add_time_from: {
            type: 'string',
            description: 'Filter deals created on or after this date (YYYY-MM-DD). Applied client-side.',
          },
          add_time_until: {
            type: 'string',
            description: 'Filter deals created on or before this date (YYYY-MM-DD). Applied client-side.',
          },
          max_items: { type: 'number', description: 'Maximum number of items to return' },
        },
      },
      handler: async (args: unknown) => {
        const validated = ListDealsSchema.omit({ start: true, limit: true })
          .extend({
            max_items: ListDealsSchema.shape.limit.optional(),
          })
          .parse(args);

        const { max_items, add_time_from, add_time_until, ...filters } = validated;

        const paginator = client.createPaginator('/deals', filters);
        const allDeals = await paginator.fetchAll(100, max_items);

        const response = {
          success: true,
          data: allDeals,
          additional_data: { total_count: allDeals.length },
        };
        const enriched = await enrichEntityWithCustomFields(client, 'deal', response);
        return applyDateFilter(enriched, add_time_from, add_time_until);
      },
    },

    deals_list_archived: {
      description: `List archived deals with pagination and filtering options.

Returns a paginated list of archived deals. Archived deals are deals that have been removed from active pipelines.

Workflow tips:
- Use same filters as deals/list (status, stage_id, user_id, person_id, org_id, etc.)
- Filter by user_id to see archived deals by specific user
- Combine with filter_id to use pre-configured Pipedrive filters
- Use start/limit for pagination (default limit: 100, max: 500)
- Useful for historical analysis and cleanup

Common use cases:
- List all archived deals: {}
- List archived deals by user: { "user_id": 123 }
- List archived deals in a specific stage: { "stage_id": 5 }
- List archived deals for a person: { "person_id": 456 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          status: {
            type: 'string',
            enum: ['open', 'won', 'lost', 'deleted', 'all_not_deleted'],
            description: 'Filter by deal status',
          },
          stage_id: { type: 'number', description: 'Filter by stage ID' },
          user_id: { type: 'number', description: 'Filter by user (owner) ID' },
          person_id: { type: 'number', description: 'Filter by person ID' },
          org_id: { type: 'number', description: 'Filter by organization ID' },
          pipeline_id: { type: 'number', description: 'Filter by pipeline ID' },
          filter_id: { type: 'number', description: 'ID of the filter to use' },
          sort: { type: 'string', description: 'Field to sort by (e.g., title, value, stage_id)' },
          owned_by_you: {
            type: 'number',
            enum: [0, 1],
            description: 'Filter deals owned by the authorized user (1 = yes, 0 = no)',
          },
          start: { type: 'number', description: 'Pagination start', default: 0 },
          limit: { type: 'number', description: 'Number of items to return', default: 100 },
        },
      },
      handler: async (args: unknown) => {
        const validated = ListDealsSchema.parse(args);
        const { start, limit, ...filters } = validated;

        const response = await client.get<{ success: boolean; data?: unknown }>(
          '/deals/archived',
          {
            ...filters,
            start: start ?? 0,
            limit: limit ?? 100,
          },
          { enabled: true, ttl: 300000 } // Cache for 5 minutes
        );
        return enrichEntityWithCustomFields(client, 'deal', response);
      },
    },
  };
}
