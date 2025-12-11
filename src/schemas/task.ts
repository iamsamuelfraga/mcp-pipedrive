import { z } from 'zod';
import { IdSchema, OptionalIdSchema, DateStringSchema } from './common.js';

/**
 * Schema for creating a new task
 */
export const CreateTaskSchema = z
  .object({
    subject: z
      .string()
      .min(1, 'Subject is required and cannot be empty')
      .max(255, 'Subject cannot exceed 255 characters')
      .describe('Task subject/title'),
    project_id: OptionalIdSchema.describe('ID of the project this task belongs to'),
    assignee_id: OptionalIdSchema.describe('ID of the user assigned to this task'),
    parent_task_id: OptionalIdSchema.describe('ID of the parent task if this is a subtask'),
    done: z
      .number()
      .int('Done must be 0 or 1')
      .min(0)
      .max(1)
      .optional()
      .default(0)
      .describe('Whether the task is done (0 = not done, 1 = done)'),
    due_date: DateStringSchema.optional().describe('Due date in YYYY-MM-DD format'),
    description: z
      .string()
      .max(2000, 'Description cannot exceed 2000 characters')
      .optional()
      .describe('Task description'),
  })
  .strict();

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

/**
 * Schema for updating a task
 */
export const UpdateTaskSchema = z
  .object({
    id: IdSchema.describe('ID of the task to update'),
    subject: z
      .string()
      .min(1, 'Subject cannot be empty')
      .max(255, 'Subject cannot exceed 255 characters')
      .optional()
      .describe('Task subject/title'),
    project_id: OptionalIdSchema.describe('ID of the project this task belongs to'),
    assignee_id: OptionalIdSchema.describe('ID of the user assigned to this task'),
    parent_task_id: OptionalIdSchema.describe('ID of the parent task if this is a subtask'),
    done: z
      .number()
      .int('Done must be 0 or 1')
      .min(0)
      .max(1)
      .optional()
      .describe('Whether the task is done (0 = not done, 1 = done)'),
    due_date: DateStringSchema.optional().describe('Due date in YYYY-MM-DD format'),
    description: z
      .string()
      .max(2000, 'Description cannot exceed 2000 characters')
      .optional()
      .describe('Task description'),
  })
  .strict();

export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

/**
 * Schema for getting a specific task
 */
export const GetTaskSchema = z.object({
  id: IdSchema.describe('ID of the task to retrieve'),
});

export type GetTaskInput = z.infer<typeof GetTaskSchema>;

/**
 * Schema for deleting a task
 */
export const DeleteTaskSchema = z.object({
  id: IdSchema.describe('ID of the task to delete'),
});

export type DeleteTaskInput = z.infer<typeof DeleteTaskSchema>;

/**
 * Schema for listing tasks with cursor-based pagination
 */
export const ListTasksSchema = z
  .object({
    cursor: z.string().optional().describe('Cursor for pagination'),
    limit: z
      .number()
      .int('Limit must be an integer')
      .positive('Limit must be positive')
      .max(500, 'Limit cannot exceed 500')
      .optional()
      .describe('Number of items to return per page'),
    assignee_id: OptionalIdSchema.describe('Filter by assignee ID'),
    project_id: OptionalIdSchema.describe('Filter by project ID'),
    parent_task_id: OptionalIdSchema.describe('Filter by parent task ID'),
    done: z
      .number()
      .int('Done must be 0 or 1')
      .min(0)
      .max(1)
      .optional()
      .describe('Filter by done status (0 = not done, 1 = done)'),
  })
  .strict();

export type ListTasksInput = z.infer<typeof ListTasksSchema>;
