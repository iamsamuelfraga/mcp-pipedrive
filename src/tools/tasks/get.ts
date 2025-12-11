import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetTaskSchema } from '../../schemas/task.js';

export function getGetTaskTool(client: PipedriveClient) {
  return {
    'tasks/get': {
      description: `Get detailed information about a specific task by ID.

Retrieves complete information about a single task including subject, description, assignee, due date, and completion status.

Workflow tips:
- Use tasks/list to find task IDs first
- Response includes all task details
- Cached for 5 minutes for better performance

Common use cases:
- Get task details: { "id": 123 }
- Check task status before updating
- Retrieve task information for display`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'number',
            description: 'ID of the task to retrieve'
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = GetTaskSchema.parse(args);
        return client.get(`/tasks/${id}`, undefined, { enabled: true, ttl: 300000 });
      },
    },
  };
}
