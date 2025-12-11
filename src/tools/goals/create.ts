import type { PipedriveClient } from '../../pipedrive-client.js';
import { CreateGoalSchema } from '../../schemas/goal.js';

export function getCreateGoalTool(client: PipedriveClient) {
  return {
    'goals/create': {
      description: `Add a new goal to track performance metrics.

Creates a goal with specified type, assignee, expected outcome, and duration.
A report is automatically created to track goal progress.

Workflow tips:
- Specify the goal type (e.g., deals_won, activities_completed)
- Assign to a user or team
- Set target value and tracking metric
- Define duration period (start and end dates)
- Choose interval (weekly, monthly, quarterly, yearly)

Common use cases:
- Track deal revenue: type with "deals_won", tracking_metric "sum"
- Track activities: type with "activities_completed", tracking_metric "count"
- Team goals: assignee type "team"`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          title: {
            type: 'string',
            description: 'Goal title'
          },
          type: {
            type: 'object',
            description: 'Goal type configuration',
            properties: {
              name: { type: 'string', description: 'Type name (e.g., deals_won, activities_completed)' },
              params: { type: 'object', description: 'Additional parameters', additionalProperties: true },
            },
            required: ['name'],
          },
          assignee: {
            type: 'object',
            description: 'User or team assigned to this goal',
            properties: {
              id: { type: 'number', description: 'Assignee ID' },
              type: { type: 'string', enum: ['person', 'team'], description: 'Assignee type' },
            },
            required: ['id', 'type'],
          },
          expected_outcome: {
            type: 'object',
            description: 'Expected outcome configuration',
            properties: {
              target: { type: 'number', description: 'Target value to achieve' },
              tracking_metric: { type: 'string', description: 'Metric to track (e.g., sum, count)' },
              currency_id: { type: 'number', description: 'Currency ID if tracking monetary value' },
            },
            required: ['target', 'tracking_metric'],
          },
          duration: {
            type: 'object',
            description: 'Goal duration period',
            properties: {
              start: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
              end: { type: 'string', description: 'End date (YYYY-MM-DD)' },
            },
            required: ['start', 'end'],
          },
          interval: {
            type: 'string',
            enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
            description: 'Goal interval',
          },
        },
        required: ['title', 'type', 'assignee', 'expected_outcome', 'duration', 'interval'],
      },
      handler: async (args: unknown) => {
        const data = CreateGoalSchema.parse(args);
        return client.post('/goals', data);
      },
    },
  };
}
