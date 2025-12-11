import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetDealsTimelineSchema } from '../../schemas/deal.js';

export function getTimelineTools(client: PipedriveClient) {
  return {
    'deals/get_deals_timeline': {
      description: `Get deals timeline grouped by intervals.

Returns open and won deals grouped by a defined interval of time set in a date-type field.

Workflow tips:
- Useful for revenue forecasting and trend analysis
- Group deals by day, week, month, or quarter
- Use field_key to specify which date field to use (e.g., add_time, update_time, close_time, expected_close_date)
- Filter by user, pipeline, or custom filter
- Set exclude_deals to true to get only summary data
- Use totals_convert_currency for multi-currency reporting

Common use cases:
- Monthly revenue forecast: { "start_date": "2024-01-01", "interval": "month", "amount": 12, "field_key": "expected_close_date" }
- Weekly deal creation trends: { "start_date": "2024-01-01", "interval": "week", "amount": 8, "field_key": "add_time" }
- Quarterly sales pipeline: { "start_date": "2024-01-01", "interval": "quarter", "amount": 4, "field_key": "close_time", "pipeline_id": 1 }
- User performance: { "start_date": "2024-01-01", "interval": "month", "amount": 6, "field_key": "won_time", "user_id": 123 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          start_date: {
            type: 'string',
            description: 'The date when the first interval starts (YYYY-MM-DD)',
          },
          interval: {
            type: 'string',
            enum: ['day', 'week', 'month', 'quarter'],
            description: 'The type of interval',
          },
          amount: { type: 'number', description: 'The number of intervals to fetch' },
          field_key: { type: 'string', description: 'The date field key to retrieve deals from' },
          user_id: { type: 'number', description: 'Filter by user ID' },
          pipeline_id: { type: 'number', description: 'Filter by pipeline ID' },
          filter_id: { type: 'number', description: 'Filter by filter ID' },
          exclude_deals: {
            type: 'number',
            enum: [0, 1],
            description: 'Whether to exclude deals list (1) or not (0)',
          },
          totals_convert_currency: {
            type: 'string',
            description: '3-letter currency code for converted totals',
          },
        },
        required: ['start_date', 'interval', 'amount', 'field_key'],
      },
      handler: async (args: unknown) => {
        const validated = GetDealsTimelineSchema.parse(args);
        return client.get('/deals/timeline', validated, { enabled: true, ttl: 300000 });
      },
    },

    'deals/get_archived_deals_timeline': {
      description: `Get archived deals timeline grouped by intervals.

Returns archived deals grouped by a defined interval of time set in a date-type field.

Workflow tips:
- Analyze historical deal patterns
- Same parameters as deals/get_deals_timeline
- Useful for understanding past performance trends
- Can help identify seasonal patterns

Common use cases:
- Historical analysis: { "start_date": "2023-01-01", "interval": "month", "amount": 12, "field_key": "close_time" }
- Archived deals by quarter: { "start_date": "2023-01-01", "interval": "quarter", "amount": 4, "field_key": "archive_time" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          start_date: {
            type: 'string',
            description: 'The date when the first interval starts (YYYY-MM-DD)',
          },
          interval: {
            type: 'string',
            enum: ['day', 'week', 'month', 'quarter'],
            description: 'The type of interval',
          },
          amount: { type: 'number', description: 'The number of intervals to fetch' },
          field_key: { type: 'string', description: 'The date field key to retrieve deals from' },
          user_id: { type: 'number', description: 'Filter by user ID' },
          pipeline_id: { type: 'number', description: 'Filter by pipeline ID' },
          filter_id: { type: 'number', description: 'Filter by filter ID' },
          exclude_deals: {
            type: 'number',
            enum: [0, 1],
            description: 'Whether to exclude deals list (1) or not (0)',
          },
          totals_convert_currency: {
            type: 'string',
            description: '3-letter currency code for converted totals',
          },
        },
        required: ['start_date', 'interval', 'amount', 'field_key'],
      },
      handler: async (args: unknown) => {
        const validated = GetDealsTimelineSchema.parse(args);
        return client.get('/deals/timeline/archived', validated, { enabled: true, ttl: 300000 });
      },
    },
  };
}
