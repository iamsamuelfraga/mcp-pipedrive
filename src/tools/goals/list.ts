import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListGoalsSchema } from '../../schemas/goal.js';

export function getListGoalsTool(client: PipedriveClient) {
  return {
    'goals_list': {
      description: `Get all goals with optional filters.

Retrieves goals based on various filtering criteria including type, title, assignee, and period.

Workflow tips:
- Filter by assignee to see goals for specific users or teams
- Use type.name to filter by goal type (e.g., deals_won, activities_completed)
- Filter by is_active to see only active or inactive goals
- Use period filters to find goals within specific date ranges

Common use cases:
- List all active goals: { "is_active": true }
- Find goals for a user: { "assignee.id": 123, "assignee.type": "person" }
- Filter by goal type: { "type.name": "deals_won" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          'type.name': {
            type: 'string',
            description: 'Filter by goal type name',
          },
          title: {
            type: 'string',
            description: 'Filter by goal title',
          },
          is_active: {
            type: 'boolean',
            description: 'Filter by active status',
          },
          'assignee.id': {
            type: 'number',
            description: 'Filter by assignee ID',
          },
          'assignee.type': {
            type: 'string',
            enum: ['person', 'team'],
            description: 'Filter by assignee type',
          },
          'expected_outcome.target': {
            type: 'number',
            description: 'Filter by target value',
          },
          'expected_outcome.tracking_metric': {
            type: 'string',
            description: 'Filter by tracking metric',
          },
          'period.start': {
            type: 'string',
            description: 'Filter by period start date (YYYY-MM-DD)',
          },
          'period.end': {
            type: 'string',
            description: 'Filter by period end date (YYYY-MM-DD)',
          },
        },
      },
      handler: async (args: unknown) => {
        const filters = ListGoalsSchema.parse(args);
        return client.get('/goals/find', filters, { enabled: true, ttl: 60000 });
      },
    },
  };
}
