import type { PipedriveClient } from '../../pipedrive-client.js';
import { CreateTaskSchema } from '../../schemas/task.js';

export function getCreateTaskTool(client: PipedriveClient) {
  return {
    'tasks/create': {
      description: `Add a new task to a project or as a standalone task.

Creates a task with subject, optional description, assignee, due date, and project association.

Workflow tips:
- Subject is required (task title)
- Assign to a user with assignee_id
- Associate with a project using project_id
- Create subtasks using parent_task_id
- Set due_date for deadline tracking
- Tasks default to not done (done = 0)

Common use cases:
- Create project task: { "subject": "Review proposal", "project_id": 123, "assignee_id": 456 }
- Create subtask: { "subject": "Research options", "parent_task_id": 789 }
- Create with due date: { "subject": "Send report", "due_date": "2024-12-31" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
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
            default: 0,
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
        required: ['subject'],
      },
      handler: async (args: unknown) => {
        const data = CreateTaskSchema.parse(args);
        return client.post('/tasks', data);
      },
    },
  };
}
