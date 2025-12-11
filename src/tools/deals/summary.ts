import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetDealSummarySchema } from '../../schemas/deal.js';

export function getSummaryTools(client: PipedriveClient) {
  return {
    'deals_get_summary': {
      description: `Get deal statistics and summary.

Returns aggregated statistics about deals, including counts by status, total values, and conversion rates.

Workflow tips:
- Useful for dashboards and reporting
- Filter by user_id to see specific user's performance
- Use stage_id to analyze specific pipeline stages
- Combine with filter_id for custom segments
- Results show counts and values by status

Common use cases:
- Overall statistics: {} (no parameters)
- User performance: { "user_id": 123 }
- Stage analysis: { "stage_id": 5 }
- Open deals summary: { "status": "open" }
- Custom filter summary: { "filter_id": 10 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          status: {
            type: 'string',
            enum: ['open', 'won', 'lost', 'deleted', 'all_not_deleted'],
            description: 'Filter by deal status',
          },
          filter_id: { type: 'number', description: 'ID of the filter to use' },
          user_id: { type: 'number', description: 'Filter by user (owner) ID' },
          stage_id: { type: 'number', description: 'Filter by stage ID' },
        },
      },
      handler: async (args: unknown) => {
        const validated = GetDealSummarySchema.parse(args);
        return client.get('/deals/summary', validated, { enabled: true, ttl: 300000 });
      },
    },

    'deals_get_archived_summary': {
      description: `Get archived deals statistics and summary.

Returns aggregated statistics about archived deals, including counts by status, total values, and conversion rates.

Workflow tips:
- Useful for historical analysis and reporting
- Filter by user_id to see specific user's archived performance
- Use stage_id to analyze archived deals from specific stages
- Combine with filter_id for custom segments
- Results show counts and values by status

Common use cases:
- Overall archived statistics: {} (no parameters)
- User archived performance: { "user_id": 123 }
- Stage archived analysis: { "stage_id": 5 }
- Archived open deals summary: { "status": "open" }
- Custom filter archived summary: { "filter_id": 10 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          status: {
            type: 'string',
            enum: ['open', 'won', 'lost', 'deleted', 'all_not_deleted'],
            description: 'Filter by deal status',
          },
          filter_id: { type: 'number', description: 'ID of the filter to use' },
          user_id: { type: 'number', description: 'Filter by user (owner) ID' },
          stage_id: { type: 'number', description: 'Filter by stage ID' },
        },
      },
      handler: async (args: unknown) => {
        const validated = GetDealSummarySchema.parse(args);
        return client.get('/deals/summary/archived', validated, { enabled: true, ttl: 300000 });
      },
    },
  };
}
