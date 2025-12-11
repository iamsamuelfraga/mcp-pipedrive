import { z } from 'zod';
import {
  IdSchema,
  OptionalIdSchema,
  DateStringSchema,
  BooleanLikeSchema,
} from './common.js';

/**
 * Project status schema
 */
export const ProjectStatusSchema = z.enum(['open', 'completed', 'canceled', 'deleted'], {
  errorMap: () => ({ message: 'Status must be one of: open, completed, canceled, deleted' }),
}).describe('Project status');

export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

/**
 * Schema for listing projects with filters
 */
export const ListProjectsSchema = z.object({
  cursor: z.string()
    .optional()
    .describe('For pagination, the marker representing the first item on the next page'),
  limit: z.number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(500, 'Limit cannot exceed 500')
    .optional()
    .default(100)
    .describe('Number of items to return per page (default: 100)'),
  filter_id: OptionalIdSchema
    .describe('ID of the filter to use'),
  status: z.string()
    .optional()
    .describe('Comma-separated statuses to include (open, completed, canceled, deleted)'),
  phase_id: OptionalIdSchema
    .describe('If supplied, only projects in specified phase are returned'),
  include_archived: BooleanLikeSchema
    .optional()
    .describe('If true, archived projects are included in response'),
}).strict();

export type ListProjectsInput = z.infer<typeof ListProjectsSchema>;

/**
 * Schema for creating a new project
 */
export const CreateProjectSchema = z.object({
  title: z.string()
    .min(1, 'Title is required and cannot be empty')
    .max(255, 'Title cannot exceed 255 characters')
    .describe('Project title'),
  board_id: IdSchema
    .describe('ID of the board to place the project in'),
  phase_id: IdSchema
    .describe('ID of the phase to place the project in'),
  description: z.string()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional()
    .describe('Project description'),
  status: ProjectStatusSchema
    .optional()
    .describe('Project status'),
  owner_id: OptionalIdSchema
    .describe('ID of the user who will be marked as the owner'),
  start_date: DateStringSchema
    .optional()
    .describe('Project start date in YYYY-MM-DD format'),
  end_date: DateStringSchema
    .optional()
    .describe('Project end date in YYYY-MM-DD format'),
  deal_ids: z.array(IdSchema)
    .optional()
    .describe('Array of deal IDs to link to the project'),
  org_id: OptionalIdSchema
    .describe('ID of the organization this project is associated with'),
  person_id: OptionalIdSchema
    .describe('ID of the person this project is associated with'),
  labels: z.array(IdSchema)
    .optional()
    .describe('Array of label IDs to assign to the project'),
  template_id: OptionalIdSchema
    .describe('ID of the project template to use'),
}).strict();

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

/**
 * Schema for updating an existing project
 */
export const UpdateProjectSchema = z.object({
  id: IdSchema
    .describe('ID of the project to update'),
  title: z.string()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title cannot exceed 255 characters')
    .optional()
    .describe('Project title'),
  board_id: OptionalIdSchema
    .describe('ID of the board to place the project in'),
  phase_id: OptionalIdSchema
    .describe('ID of the phase to place the project in'),
  description: z.string()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional()
    .describe('Project description'),
  status: ProjectStatusSchema
    .optional()
    .describe('Project status'),
  owner_id: OptionalIdSchema
    .describe('ID of the user who will be marked as the owner'),
  start_date: DateStringSchema
    .optional()
    .describe('Project start date in YYYY-MM-DD format'),
  end_date: DateStringSchema
    .optional()
    .describe('Project end date in YYYY-MM-DD format'),
  deal_ids: z.array(IdSchema)
    .optional()
    .describe('Array of deal IDs to link to the project'),
  org_id: OptionalIdSchema
    .describe('ID of the organization this project is associated with'),
  person_id: OptionalIdSchema
    .describe('ID of the person this project is associated with'),
  labels: z.array(IdSchema)
    .optional()
    .describe('Array of label IDs to assign to the project'),
}).strict();

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

/**
 * Schema for getting a single project
 */
export const GetProjectSchema = z.object({
  id: IdSchema
    .describe('ID of the project to retrieve'),
}).strict();

export type GetProjectInput = z.infer<typeof GetProjectSchema>;

/**
 * Schema for deleting a project
 */
export const DeleteProjectSchema = z.object({
  id: IdSchema
    .describe('ID of the project to delete'),
}).strict();

export type DeleteProjectInput = z.infer<typeof DeleteProjectSchema>;

/**
 * Schema for archiving/unarchiving a project
 */
export const ArchiveProjectSchema = z.object({
  id: IdSchema
    .describe('ID of the project to archive or unarchive'),
}).strict();

export type ArchiveProjectInput = z.infer<typeof ArchiveProjectSchema>;

/**
 * Schema for getting project plan
 */
export const GetProjectPlanSchema = z.object({
  id: IdSchema
    .describe('ID of the project'),
}).strict();

export type GetProjectPlanInput = z.infer<typeof GetProjectPlanSchema>;

/**
 * Schema for updating activity in project plan
 */
export const UpdateProjectPlanActivitySchema = z.object({
  id: IdSchema
    .describe('ID of the project'),
  activity_id: IdSchema
    .describe('ID of the activity'),
  phase_id: OptionalIdSchema
    .describe('ID of the phase to move the activity to'),
  group_id: OptionalIdSchema
    .describe('ID of the group to move the activity to'),
}).strict();

export type UpdateProjectPlanActivityInput = z.infer<typeof UpdateProjectPlanActivitySchema>;

/**
 * Schema for updating task in project plan
 */
export const UpdateProjectPlanTaskSchema = z.object({
  id: IdSchema
    .describe('ID of the project'),
  task_id: IdSchema
    .describe('ID of the task'),
  phase_id: OptionalIdSchema
    .describe('ID of the phase to move the task to'),
  group_id: OptionalIdSchema
    .describe('ID of the group to move the task to'),
}).strict();

export type UpdateProjectPlanTaskInput = z.infer<typeof UpdateProjectPlanTaskSchema>;

/**
 * Schema for getting project groups
 */
export const GetProjectGroupsSchema = z.object({
  id: IdSchema
    .describe('ID of the project'),
}).strict();

export type GetProjectGroupsInput = z.infer<typeof GetProjectGroupsSchema>;

/**
 * Schema for getting project tasks
 */
export const GetProjectTasksSchema = z.object({
  id: IdSchema
    .describe('ID of the project'),
}).strict();

export type GetProjectTasksInput = z.infer<typeof GetProjectTasksSchema>;

/**
 * Schema for getting project activities
 */
export const GetProjectActivitiesSchema = z.object({
  id: IdSchema
    .describe('ID of the project'),
}).strict();

export type GetProjectActivitiesInput = z.infer<typeof GetProjectActivitiesSchema>;

/**
 * Schema for getting project phases
 */
export const GetProjectPhasesSchema = z.object({
  board_id: IdSchema
    .describe('ID of the board for which phases are requested'),
}).strict();

export type GetProjectPhasesInput = z.infer<typeof GetProjectPhasesSchema>;

/**
 * Schema for getting all project boards
 */
export const GetProjectBoardsSchema = z.object({}).strict();

export type GetProjectBoardsInput = z.infer<typeof GetProjectBoardsSchema>;

/**
 * Schema for getting a single project board
 */
export const GetProjectBoardSchema = z.object({
  id: IdSchema
    .describe('ID of the board to retrieve'),
}).strict();

export type GetProjectBoardInput = z.infer<typeof GetProjectBoardSchema>;

/**
 * Schema for getting a single project phase
 */
export const GetProjectPhaseSchema = z.object({
  id: IdSchema
    .describe('ID of the phase to retrieve'),
}).strict();

export type GetProjectPhaseInput = z.infer<typeof GetProjectPhaseSchema>;
