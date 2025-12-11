import type { PipedriveClient } from '../../pipedrive-client.js';
import {
  GetPipelineConversionStatisticsSchema,
  GetPipelineMovementStatisticsSchema,
  GetPipelineDealsSchema,
} from '../../schemas/pipeline.js';

/**
 * Get all pipeline analytics/statistics tools for the MCP server
 *
 * These are analytics endpoints that should be cached heavily (15 minutes)
 * as they are used for reporting and don't change frequently.
 */
export function getPipelineAnalyticsTools(client: PipedriveClient) {
  return {
    'pipelines/conversion_statistics': {
      description: `Get deal conversion rates in a pipeline for a specific time period.

Returns stage-to-stage conversion rates and pipeline-to-close rates, showing how deals progress through the pipeline.

Response includes:
- stage_conversions: Array of conversion rates between stages
- won_conversion: Rate of deals won
- lost_conversion: Rate of deals lost

Workflow tips:
- Requires start_date and end_date in YYYY-MM-DD format
- Defaults to authorized user unless user_id is specified
- Use to analyze pipeline efficiency and identify bottlenecks
- Track conversion improvements over time
- Compare different time periods or users

Common use cases:
- Get Q4 2023 conversions: { "id": 1, "start_date": "2023-10-01", "end_date": "2023-12-31" }
- Track specific user performance: { "id": 1, "start_date": "2023-01-01", "end_date": "2023-12-31", "user_id": 123 }
- Identify weak conversion points in pipeline
- Monitor sales team effectiveness`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the pipeline' },
          start_date: {
            type: 'string',
            description: 'Start date in YYYY-MM-DD format (e.g., 2023-01-01)',
          },
          end_date: {
            type: 'string',
            description: 'End date in YYYY-MM-DD format (e.g., 2023-12-31)',
          },
          user_id: {
            type: 'number',
            description: 'ID of user to fetch statistics for (optional, defaults to authorized user)',
          },
        },
        required: ['id', 'start_date', 'end_date'],
      },
      handler: async (args: unknown) => {
        const validated = GetPipelineConversionStatisticsSchema.parse(args);
        const { id, ...params } = validated;

        return client.get(
          `/pipelines/${id}/conversion_statistics`,
          params,
          { enabled: true, ttl: 900000 } // Cache for 15 minutes
        );
      },
    },

    'pipelines/movement_statistics': {
      description: `Get deal movement statistics in a pipeline for a specific time period.

Returns comprehensive statistics about how deals moved through the pipeline, including new deals, won/lost deals, and average deal age.

Response includes:
- movements_between_stages: Count of stage transitions
- new_deals: Count, IDs, values of new deals created
- deals_left_open: Deals still in pipeline
- won_deals: Successfully closed deals
- lost_deals: Lost opportunities
- average_age_in_days: Deal duration metrics by stage

Workflow tips:
- Requires start_date and end_date in YYYY-MM-DD format
- Defaults to authorized user unless user_id is specified
- Values returned in multiple currencies
- Use to understand pipeline velocity and deal flow
- Track deal aging and identify stalled deals

Common use cases:
- Monthly pipeline report: { "id": 1, "start_date": "2023-10-01", "end_date": "2023-10-31" }
- Track team member activity: { "id": 1, "start_date": "2023-01-01", "end_date": "2023-12-31", "user_id": 123 }
- Analyze deal flow patterns
- Monitor sales cycle length
- Identify pipeline bottlenecks`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the pipeline' },
          start_date: {
            type: 'string',
            description: 'Start date in YYYY-MM-DD format (e.g., 2023-01-01)',
          },
          end_date: {
            type: 'string',
            description: 'End date in YYYY-MM-DD format (e.g., 2023-12-31)',
          },
          user_id: {
            type: 'number',
            description: 'ID of user to fetch statistics for (optional, defaults to authorized user)',
          },
        },
        required: ['id', 'start_date', 'end_date'],
      },
      handler: async (args: unknown) => {
        const validated = GetPipelineMovementStatisticsSchema.parse(args);
        const { id, ...params } = validated;

        return client.get(
          `/pipelines/${id}/movement_statistics`,
          params,
          { enabled: true, ttl: 900000 } // Cache for 15 minutes
        );
      },
    },

    'pipelines/deals': {
      description: `Get all deals in a specific pipeline.

Returns a list of deals in the pipeline with optional filtering by stage, user, or custom filter. Includes pagination support and optional summary statistics.

Workflow tips:
- Filter by stage_id to see deals in specific stage
- Use everyone=1 to see all deals (ignores filter_id and user_id)
- Set get_summary=1 to include pipeline totals in additional_data
- Use totals_convert_currency to convert values to specific currency
- Supports pagination with start and limit parameters
- Can apply custom filters with filter_id

Common use cases:
- Get all deals in pipeline: { "id": 1 }
- Get deals in specific stage: { "id": 1, "stage_id": 5 }
- Get deals for user: { "id": 1, "user_id": 123 }
- Get everyone's deals with summary: { "id": 1, "everyone": 1, "get_summary": 1 }
- Paginated results: { "id": 1, "start": 0, "limit": 50 }
- Convert to USD: { "id": 1, "totals_convert_currency": "USD", "get_summary": 1 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the pipeline' },
          filter_id: {
            type: 'number',
            description: 'Only return deals matching this filter',
          },
          user_id: {
            type: 'number',
            description: 'Only return deals owned by this user (defaults to authorized user)',
          },
          everyone: {
            type: 'number',
            description: 'Set to 1 to return deals owned by everyone (ignores filter_id and user_id)',
          },
          stage_id: {
            type: 'number',
            description: 'Only return deals in this specific stage',
          },
          start: {
            type: 'number',
            description: 'Pagination start offset (default: 0)',
          },
          limit: {
            type: 'number',
            description: 'Number of items per page',
          },
          get_summary: {
            type: 'number',
            description: 'Set to 1 to include pipeline summary in additional_data',
          },
          totals_convert_currency: {
            type: 'string',
            description: '3-letter currency code (e.g., USD, EUR) or "default_currency"',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = GetPipelineDealsSchema.parse(args);
        const { id, ...params } = validated;

        return client.get(
          `/pipelines/${id}/deals`,
          params,
          { enabled: true, ttl: 900000 } // Cache for 15 minutes
        );
      },
    },
  };
}
