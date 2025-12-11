import type { PipedriveClient } from '../../pipedrive-client.js';
import { UpdateGoalSchema } from '../../schemas/goal.js';

export function getUpdateGoalTool(client: PipedriveClient) {
  return {
    'goals_update': {
      description: `Update an existing goal.

Updates goal properties such as title, type, assignee, expected outcome, duration, or interval.

Workflow tips:
- Use goals/list to find the goal ID first
- Only include fields you want to update
- Changes take effect immediately in goal tracking

Common use cases:
- Adjust target value: { "id": "goal-id", "expected_outcome": { "target": 50000, "tracking_metric": "sum" } }
- Change assignee: { "id": "goal-id", "assignee": { "id": 456, "type": "person" } }
- Update title: { "id": "goal-id", "title": "New Goal Title" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'string',
            description: 'ID of the goal to update',
          },
          title: {
            type: 'string',
            description: 'Goal title',
          },
          type: {
            type: 'object',
            description: 'Goal type configuration',
            properties: {
              name: { type: 'string' },
              params: { type: 'object', additionalProperties: true },
            },
          },
          assignee: {
            type: 'object',
            description: 'User or team assigned to this goal',
            properties: {
              id: { type: 'number' },
              type: { type: 'string', enum: ['person', 'team'] },
            },
          },
          expected_outcome: {
            type: 'object',
            description: 'Expected outcome configuration',
            properties: {
              target: { type: 'number' },
              tracking_metric: { type: 'string' },
              currency_id: { type: 'number' },
            },
          },
          duration: {
            type: 'object',
            description: 'Goal duration period',
            properties: {
              start: { type: 'string' },
              end: { type: 'string' },
            },
          },
          interval: {
            type: 'string',
            enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
            description: 'Goal interval',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, ...data } = UpdateGoalSchema.parse(args);
        return client.put(`/goals/${id}`, data);
      },
    },
  };
}
