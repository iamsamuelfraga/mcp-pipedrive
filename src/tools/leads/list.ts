import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListLeadsSchema } from '../../schemas/lead.js';

export function getListLeadsTools(client: PipedriveClient) {
  return {
    'leads_list': {
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

    'leads_list_all_auto': {
      description: `Get all leads from Pipedrive with flexible filtering options including search by title, date range, owner, archived status, value, and more. Use 'leads/list_users' tool first to find owner IDs.

This tool automatically handles pagination and returns ALL matching leads in a single response.

Workflow tips:
- Use search_title for partial title matching (case-insensitive)
- Use date_from/date_to for a specific date range, or days_back for a rolling window
- Use owner_id to filter by lead owner (use users tools to find IDs)
- archived_status defaults to 'not_archived'; use 'all' to include archived leads
- Use min_value/max_value to filter by lead value amount
- Use max_items to cap total results

Common use cases:
- Get all leads: {}
- Search by title: { "search_title": "Acme" }
- Leads added in last 30 days: { "days_back": 30 }
- Leads in date range: { "date_from": "2026-01-01", "date_to": "2026-02-16" }
- Leads by owner: { "owner_id": 123 }
- Leads with value range: { "min_value": 1000, "max_value": 50000 }
- All leads including archived: { "archived_status": "all" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          owner_id: { type: 'number', description: 'Filter by owner (user) ID (use get-users tool to find IDs)' },
          person_id: { type: 'number', description: 'Filter by person ID' },
          organization_id: { type: 'number', description: 'Filter by organization ID' },
          filter_id: { type: 'number', description: 'ID of the filter to use' },
          sort: { type: 'string', description: 'Field names and sorting mode' },
          max_items: { type: 'number', description: 'Maximum number of leads to return (default: 500)' },
          search_title: { type: 'string', description: 'Search leads by title/name (partial matches supported)' },
          days_back: { type: 'number', description: 'Number of days back to fetch leads based on add_time (default: 365, ignored if date_from/date_to specified)' },
          date_from: { type: 'string', description: 'Start date for filtering leads by add_time (format: YYYY-MM-DD, e.g. "2026-01-01")' },
          date_to: { type: 'string', description: 'End date for filtering leads by add_time (format: YYYY-MM-DD, e.g. "2026-02-16")' },
          archived_status: {
            type: 'string',
            enum: ['archived', 'not_archived', 'all'],
            description: 'Filter leads by archived status (default: not_archived)',
          },
          min_value: { type: 'number', description: 'Minimum lead value filter' },
          max_value: { type: 'number', description: 'Maximum lead value filter' },
        },
      },
      handler: async (args: unknown) => {
        const validated = ListLeadsSchema.omit({ start: true, limit: true })
          .extend({
            max_items: ListLeadsSchema.shape.limit.optional(),
          })
          .parse(args);

        const {
          max_items = 500,
          search_title,
          days_back = 365,
          date_from,
          date_to,
          archived_status = 'not_archived',
          min_value,
          max_value,
          ...apiFilters
        } = validated;

        // Build API-level params (supported natively by Pipedrive)
        const apiParams: Record<string, string | number | boolean> = {
          ...(apiFilters as Record<string, string | number | boolean>),
        };
        if (archived_status !== 'all') {
          apiParams.archived_status = archived_status;
        }

        const paginator = client.createPaginator('/leads', apiParams);
        let leads: any[] = await paginator.fetchAll(100, max_items);

        // Client-side date filtering (only when not searching by title)
        if (!search_title) {
          if (date_from || date_to) {
            const startDate = date_from ? new Date(date_from) : new Date(0);
            const endDate = date_to ? new Date(date_to) : new Date();
            endDate.setHours(23, 59, 59, 999);
            leads = leads.filter((lead: any) => {
              if (!lead.add_time) return false;
              const leadAddDate = new Date(lead.add_time);
              return leadAddDate >= startDate && leadAddDate <= endDate;
            });
          } else if (days_back) {
            const filterDate = new Date();
            filterDate.setDate(filterDate.getDate() - days_back);
            leads = leads.filter((lead: any) => {
              if (!lead.add_time) return false;
              return new Date(lead.add_time) >= filterDate;
            });
          }
        }

        // Client-side title search
        if (search_title) {
          const searchLower = search_title.toLowerCase();
          leads = leads.filter((lead: any) =>
            lead.title && lead.title.toLowerCase().includes(searchLower)
          );
        }

        // Client-side value range filter
        if (min_value !== undefined || max_value !== undefined) {
          leads = leads.filter((lead: any) => {
            const value = lead.value?.amount ?? 0;
            if (min_value !== undefined && value < min_value) return false;
            if (max_value !== undefined && value > max_value) return false;
            return true;
          });
        }

        // Apply final limit
        if (leads.length > max_items) {
          leads = leads.slice(0, max_items);
        }

        // Build filter summary
        const filterSummary: Record<string, unknown> = {
          archived_status,
          ...(apiFilters.owner_id && { owner_id: apiFilters.owner_id }),
          ...(search_title && { search_title }),
          ...(!search_title && (date_from || date_to) && {
            date_from: date_from ?? 'epoch',
            date_to: date_to ?? 'now',
          }),
          ...(!search_title && !date_from && !date_to && {
            days_back,
            filter_date: new Date(Date.now() - days_back * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
          }),
          ...(min_value !== undefined && { min_value }),
          ...(max_value !== undefined && { max_value }),
          total_leads_found: leads.length,
          limit_applied: max_items,
        };

        // Summarize leads for cleaner output
        const summarizedLeads = leads.map((lead: any) => ({
          id: lead.id,
          title: lead.title,
          value: lead.value,
          owner_id: lead.owner_id,
          owner_name: lead.owner?.name ?? null,
          person_id: lead.person_id,
          person_name: lead.person?.name ?? null,
          organization_id: lead.organization_id,
          organization_name: lead.organization?.name ?? null,
          is_archived: lead.is_archived,
          add_time: lead.add_time,
          update_time: lead.update_time,
          source_name: lead.source_name,
          origin: lead.origin,
          channel: lead.channel,
          label_ids: lead.label_ids ?? [],
        }));

        return {
          success: true,
          data: summarizedLeads,
          additional_data: {
            summary: search_title
              ? `Found ${leads.length} leads matching title search "${search_title}"`
              : `Found ${leads.length} leads matching the specified filters`,
            filters_applied: filterSummary,
            total_count: leads.length,
          },
        };
      },
    },
  };
}
