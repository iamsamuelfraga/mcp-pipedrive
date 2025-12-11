import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeleteTaskSchema } from '../../schemas/task.js';

export function getDeleteTaskTool(client: PipedriveClient) {
  return {
    'tasks/delete': {
      description: `Delete an existing task.

Permanently removes a task from the system.

Workflow tips:
- Use tasks/list to find the task ID first
- This action cannot be undone
- Deleting a parent task may affect subtasks

Common use cases:
- Remove completed task: { "id": 123 }
- Clean up old tasks: { "id": 456 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'number',
            description: 'ID of the task to delete'
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = DeleteTaskSchema.parse(args);
        return client.delete(`/tasks/${id}`);
      },
    },
  };
}
