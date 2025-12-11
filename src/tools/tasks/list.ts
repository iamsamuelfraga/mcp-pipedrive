import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListTasksSchema } from '../../schemas/task.js';

export function getListTasksTool(client: PipedriveClient) {
  return {
    'tasks/list': {
      description: `Get all tasks with optional filters.

Retrieves tasks using cursor-based pagination. Can filter by assignee, project, parent task, and completion status.

Workflow tips:
- Use cursor for pagination through large result sets
- Filter by assignee_id to see tasks for specific users
- Filter by project_id to see project tasks
- Filter by done status (0 = not done, 1 = done)
- Filter by parent_task_id to see subtasks

Common use cases:
- List all incomplete tasks: { "done": 0 }
- Get tasks for a user: { "assignee_id": 123 }
- Get project tasks: { "project_id": 456 }
- Get subtasks: { "parent_task_id": 789 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          cursor: {
            type: 'string',
            description: 'Cursor for pagination',
          },
          limit: {
            type: 'number',
            description: 'Number of items to return (max 500)',
          },
          assignee_id: {
            type: 'number',
            description: 'Filter by assignee ID',
          },
          project_id: {
            type: 'number',
            description: 'Filter by project ID',
          },
          parent_task_id: {
            type: 'number',
            description: 'Filter by parent task ID',
          },
          done: {
            type: 'number',
            enum: [0, 1],
            description: 'Filter by done status (0 = not done, 1 = done)',
          },
        },
      },
      handler: async (args: unknown) => {
        const params = ListTasksSchema.parse(args);
        return client.get('/tasks', params, { enabled: true, ttl: 60000 });
      },
    },
  };
}
