import type { PipedriveClient } from '../../pipedrive-client.js';
import { UpdateTaskSchema } from '../../schemas/task.js';

export function getUpdateTaskTool(client: PipedriveClient) {
  return {
    'tasks/update': {
      description: `Update an existing task.

Updates task properties such as subject, description, assignee, due date, or completion status.

Workflow tips:
- Use tasks/list or tasks/get to find the task ID first
- Only include fields you want to update
- Set done = 1 to mark as completed
- Changes take effect immediately

Common use cases:
- Mark as done: { "id": 123, "done": 1 }
- Reassign task: { "id": 123, "assignee_id": 456 }
- Update due date: { "id": 123, "due_date": "2024-12-31" }
- Update subject: { "id": 123, "subject": "Updated Task Title" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'number',
            description: 'ID of the task to update',
          },
          subject: {
            type: 'string',
            description: 'Task subject/title',
          },
          project_id: {
            type: 'number',
            description: 'ID of the project this task belongs to',
          },
          assignee_id: {
            type: 'number',
            description: 'ID of the user assigned to this task',
          },
          parent_task_id: {
            type: 'number',
            description: 'ID of the parent task if this is a subtask',
          },
          done: {
            type: 'number',
            enum: [0, 1],
            description: 'Whether the task is done (0 = not done, 1 = done)',
          },
          due_date: {
            type: 'string',
            description: 'Due date in YYYY-MM-DD format',
          },
          description: {
            type: 'string',
            description: 'Task description',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, ...data } = UpdateTaskSchema.parse(args);
        return client.put(`/tasks/${id}`, data);
      },
    },
  };
}
