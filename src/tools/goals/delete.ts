import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeleteGoalSchema } from '../../schemas/goal.js';

export function getDeleteGoalTool(client: PipedriveClient) {
  return {
    'goals/delete': {
      description: `Delete an existing goal.

Permanently removes a goal. The associated report will also be deleted.

Workflow tips:
- Use goals/list to find the goal ID first
- This action cannot be undone
- Related reports will be removed

Common use cases:
- Remove completed goal: { "id": "goal-id" }
- Clean up old goals: { "id": "goal-id" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'string',
            description: 'ID of the goal to delete',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = DeleteGoalSchema.parse(args);
        return client.delete(`/goals/${id}`);
      },
    },
  };
}
