import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetGoalResultsSchema } from '../../schemas/goal.js';

export function getGetGoalResultsTool(client: PipedriveClient) {
  return {
    'goals_get_results': {
      description: `Get the progress and results of a goal for a specified period.

Retrieves goal progress data including current value, target, and completion percentage.

Workflow tips:
- Use goals/list to find the goal ID first
- Specify period.start and period.end to get results for specific timeframe
- Results show progress toward the goal target
- Use to track performance over time

Common use cases:
- Check current goal progress: { "id": "goal-id", "period.start": "2024-01-01", "period.end": "2024-01-31" }
- Monthly goal tracking: Specify start and end of month
- Compare periods: Get results for different date ranges`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'string',
            description: 'ID of the goal',
          },
          'period.start': {
            type: 'string',
            description: 'Period start date (YYYY-MM-DD)',
          },
          'period.end': {
            type: 'string',
            description: 'Period end date (YYYY-MM-DD)',
          },
        },
        required: ['id', 'period.start', 'period.end'],
      },
      handler: async (args: unknown) => {
        const { id, ...params } = GetGoalResultsSchema.parse(args);
        return client.get(`/goals/${id}/results`, params, { enabled: true, ttl: 30000 });
      },
    },
  };
}
