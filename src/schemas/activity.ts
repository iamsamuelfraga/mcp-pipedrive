import { z } from 'zod';
import {
  IdSchema,
  OptionalIdSchema,
  DateStringSchema,
  DateTimeStringSchema,
  PaginationSchema,
  SortDirectionSchema,
  BooleanLikeSchema,
} from './common.js';

/**
 * Activity type enumeration
 */
export const ActivityTypeSchema = z.enum([
  'call',
  'meeting',
  'task',
  'deadline',
  'email',
  'lunch',
], {
  errorMap: () => ({ message: 'Activity type must be one of: call, meeting, task, deadline, email, lunch' }),
}).describe('Type of activity');

export type ActivityType = z.infer<typeof ActivityTypeSchema>;

/**
 * Duration unit schema
 */
export const DurationUnitSchema = z.enum(['h', 'm'], {
  errorMap: () => ({ message: 'Duration unit must be h (hours) or m (minutes)' }),
}).describe('Duration unit');

export type DurationUnit = z.infer<typeof DurationUnitSchema>;

/**
 * Schema for creating a new activity
 */
export const CreateActivitySchema = z.object({
  subject: z.string()
    .min(1, 'Subject is required and cannot be empty')
    .max(255, 'Subject cannot exceed 255 characters')
    .describe('Subject/title of the activity'),
  type: ActivityTypeSchema
    .describe('Type of the activity'),
  due_date: DateStringSchema
    .describe('Due date of the activity in YYYY-MM-DD format'),
  due_time: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Due time must be in HH:MM format (24-hour)')
    .optional()
    .describe('Due time in HH:MM format'),
  duration: z.string()
    .regex(/^(\d{1,2}):([0-5]\d)$/, 'Duration must be in HH:MM format')
    .optional()
    .describe('Duration in HH:MM format'),
  user_id: OptionalIdSchema
    .describe('ID of the user this activity is assigned to'),
  deal_id: OptionalIdSchema
    .describe('ID of the deal this activity is associated with'),
  person_id: OptionalIdSchema
    .describe('ID of the person this activity is associated with'),
  org_id: OptionalIdSchema
    .describe('ID of the organization this activity is associated with'),
  location: z.string()
    .max(255, 'Location cannot exceed 255 characters')
    .optional()
    .describe('Location of the activity'),
  note: z.string()
    .max(65535, 'Note cannot exceed 65535 characters')
    .optional()
    .describe('Note about the activity'),
  public_description: z.string()
    .max(1000, 'Public description cannot exceed 1000 characters')
    .optional()
    .describe('Public description visible to participants'),
  done: BooleanLikeSchema
    .optional()
    .default(false)
    .describe('Whether the activity is marked as done'),
  participants: z.array(
    z.object({
      person_id: IdSchema.describe('ID of the participant'),
      primary_flag: BooleanLikeSchema
        .optional()
        .default(false)
        .describe('Whether this is the primary participant'),
    })
  )
    .optional()
    .describe('Array of participants'),
  busy_flag: BooleanLikeSchema
    .optional()
    .describe('Whether the activity shows as busy in calendar'),
  attendees: z.array(
    z.object({
      email_address: z.string()
        .email('Invalid email address')
        .describe('Email address of the attendee'),
      name: z.string()
        .optional()
        .describe('Name of the attendee'),
    })
  )
    .optional()
    .describe('Array of email attendees for meetings/calls'),
}).strict().refine(
  (data) => {
    // At least one association (deal, person, or org) should be provided
    return data.deal_id !== undefined || data.person_id !== undefined || data.org_id !== undefined;
  },
  {
    message: 'At least one of deal_id, person_id, or org_id must be provided',
    path: ['deal_id'],
  }
);

export type CreateActivityInput = z.infer<typeof CreateActivitySchema>;

/**
 * Schema for updating an existing activity
 */
export const UpdateActivitySchema = z.object({
  id: IdSchema
    .describe('ID of the activity to update'),
  subject: z.string()
    .min(1, 'Subject cannot be empty')
    .max(255, 'Subject cannot exceed 255 characters')
    .optional()
    .describe('Subject/title of the activity'),
  type: ActivityTypeSchema
    .optional()
    .describe('Type of the activity'),
  due_date: DateStringSchema
    .optional()
    .describe('Due date of the activity in YYYY-MM-DD format'),
  due_time: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Due time must be in HH:MM format (24-hour)')
    .optional()
    .describe('Due time in HH:MM format'),
  duration: z.string()
    .regex(/^(\d{1,2}):([0-5]\d)$/, 'Duration must be in HH:MM format')
    .optional()
    .describe('Duration in HH:MM format'),
  user_id: OptionalIdSchema
    .describe('ID of the user this activity is assigned to'),
  deal_id: OptionalIdSchema
    .describe('ID of the deal this activity is associated with'),
  person_id: OptionalIdSchema
    .describe('ID of the person this activity is associated with'),
  org_id: OptionalIdSchema
    .describe('ID of the organization this activity is associated with'),
  location: z.string()
    .max(255, 'Location cannot exceed 255 characters')
    .optional()
    .describe('Location of the activity'),
  note: z.string()
    .max(65535, 'Note cannot exceed 65535 characters')
    .optional()
    .describe('Note about the activity'),
  public_description: z.string()
    .max(1000, 'Public description cannot exceed 1000 characters')
    .optional()
    .describe('Public description visible to participants'),
  done: BooleanLikeSchema
    .optional()
    .describe('Whether the activity is marked as done'),
  participants: z.array(
    z.object({
      person_id: IdSchema.describe('ID of the participant'),
      primary_flag: BooleanLikeSchema
        .optional()
        .default(false)
        .describe('Whether this is the primary participant'),
    })
  )
    .optional()
    .describe('Array of participants'),
  busy_flag: BooleanLikeSchema
    .optional()
    .describe('Whether the activity shows as busy in calendar'),
  attendees: z.array(
    z.object({
      email_address: z.string()
        .email('Invalid email address')
        .describe('Email address of the attendee'),
      name: z.string()
        .optional()
        .describe('Name of the attendee'),
    })
  )
    .optional()
    .describe('Array of email attendees'),
}).strict();

export type UpdateActivityInput = z.infer<typeof UpdateActivitySchema>;

/**
 * Schema for listing activities with filters
 */
export const ListActivitiesSchema = PaginationSchema.extend({
  user_id: OptionalIdSchema
    .describe('Filter by user (assignee) ID'),
  deal_id: OptionalIdSchema
    .describe('Filter by deal ID'),
  person_id: OptionalIdSchema
    .describe('Filter by person ID'),
  org_id: OptionalIdSchema
    .describe('Filter by organization ID'),
  type: ActivityTypeSchema
    .optional()
    .describe('Filter by activity type'),
  done: BooleanLikeSchema
    .optional()
    .describe('Filter by completion status'),
  start_date: DateStringSchema
    .optional()
    .describe('Start date for filtering (YYYY-MM-DD)'),
  end_date: DateStringSchema
    .optional()
    .describe('End date for filtering (YYYY-MM-DD)'),
  filter_id: OptionalIdSchema
    .describe('ID of the filter to use'),
  sort: z.string()
    .optional()
    .describe('Field to sort by (e.g., due_date, add_time, subject)'),
  sort_by: SortDirectionSchema
    .optional()
    .describe('Sort direction'),
}).strict().refine(
  (data) => {
    // If both dates are provided, start_date should be before end_date
    if (data.start_date && data.end_date) {
      return data.start_date <= data.end_date;
    }
    return true;
  },
  {
    message: 'Start date must be before or equal to end date',
    path: ['end_date'],
  }
);

export type ListActivitiesInput = z.infer<typeof ListActivitiesSchema>;

/**
 * Schema for getting a single activity
 */
export const GetActivitySchema = z.object({
  id: IdSchema
    .describe('ID of the activity to retrieve'),
}).strict();

export type GetActivityInput = z.infer<typeof GetActivitySchema>;

/**
 * Schema for deleting an activity
 */
export const DeleteActivitySchema = z.object({
  id: IdSchema
    .describe('ID of the activity to delete'),
}).strict();

export type DeleteActivityInput = z.infer<typeof DeleteActivitySchema>;

/**
 * Schema for marking an activity as done
 */
export const MarkActivityDoneSchema = z.object({
  id: IdSchema
    .describe('ID of the activity to mark as done'),
}).strict();

export type MarkActivityDoneInput = z.infer<typeof MarkActivityDoneSchema>;

/**
 * Schema for marking an activity as undone
 */
export const MarkActivityUndoneSchema = z.object({
  id: IdSchema
    .describe('ID of the activity to mark as undone'),
}).strict();

export type MarkActivityUndoneInput = z.infer<typeof MarkActivityUndoneSchema>;

/**
 * Schema for bulk deleting activities
 */
export const BulkDeleteActivitiesSchema = z.object({
  ids: z.array(IdSchema)
    .min(1, 'At least one activity ID is required')
    .max(100, 'Cannot delete more than 100 activities at once')
    .describe('Array of activity IDs to delete'),
}).strict();

export type BulkDeleteActivitiesInput = z.infer<typeof BulkDeleteActivitiesSchema>;

/**
 * Schema for bulk updating activities
 */
export const BulkUpdateActivitiesSchema = z.object({
  ids: z.array(IdSchema)
    .min(1, 'At least one activity ID is required')
    .max(100, 'Cannot update more than 100 activities at once')
    .describe('Array of activity IDs to update'),
  user_id: OptionalIdSchema
    .describe('New assignee user ID'),
  done: BooleanLikeSchema
    .optional()
    .describe('Mark activities as done/undone'),
  type: ActivityTypeSchema
    .optional()
    .describe('New activity type'),
}).strict();

export type BulkUpdateActivitiesInput = z.infer<typeof BulkUpdateActivitiesSchema>;

/**
 * Schema for getting activities collection
 */
export const GetActivitiesCollectionSchema = z.object({
  user_id: OptionalIdSchema
    .describe('Filter by user ID'),
  type: ActivityTypeSchema
    .optional()
    .describe('Filter by activity type'),
  cursor: z.string()
    .optional()
    .describe('Cursor for pagination'),
  limit: z.number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(500, 'Limit cannot exceed 500')
    .optional()
    .default(100)
    .describe('Number of items to return'),
  since: DateTimeStringSchema
    .optional()
    .describe('Filter activities modified since this timestamp'),
  until: DateTimeStringSchema
    .optional()
    .describe('Filter activities modified until this timestamp'),
}).strict();

export type GetActivitiesCollectionInput = z.infer<typeof GetActivitiesCollectionSchema>;
