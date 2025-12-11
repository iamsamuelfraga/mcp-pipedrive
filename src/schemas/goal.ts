import { z } from 'zod';
import { IdSchema, OptionalIdSchema, DateStringSchema } from './common.js';

/**
 * Schema for goal type configuration
 */
export const GoalTypeSchema = z.object({
  name: z.string()
    .min(1, 'Goal type name is required')
    .describe('Type of goal (e.g., deals_won, activities_completed)'),
  params: z.record(z.unknown())
    .optional()
    .describe('Additional parameters for the goal type'),
});

/**
 * Schema for goal assignee
 */
export const GoalAssigneeSchema = z.object({
  id: IdSchema
    .describe('User or team ID'),
  type: z.enum(['person', 'team'], {
    errorMap: () => ({ message: 'Assignee type must be either person or team' }),
  })
    .describe('Type of assignee'),
});

/**
 * Schema for expected outcome
 */
export const ExpectedOutcomeSchema = z.object({
  target: z.number()
    .positive('Target must be positive')
    .describe('Target value to achieve'),
  tracking_metric: z.string()
    .min(1, 'Tracking metric is required')
    .describe('Metric to track (e.g., sum, count)'),
  currency_id: OptionalIdSchema
    .describe('Currency ID if tracking monetary value'),
});

/**
 * Schema for goal duration
 */
export const GoalDurationSchema = z.object({
  start: DateStringSchema
    .describe('Start date in YYYY-MM-DD format'),
  end: DateStringSchema
    .describe('End date in YYYY-MM-DD format'),
});

/**
 * Schema for creating a new goal
 */
export const CreateGoalSchema = z.object({
  title: z.string()
    .min(1, 'Title is required and cannot be empty')
    .max(255, 'Title cannot exceed 255 characters')
    .describe('Goal title'),
  type: GoalTypeSchema
    .describe('Goal type configuration'),
  assignee: GoalAssigneeSchema
    .describe('User or team assigned to this goal'),
  expected_outcome: ExpectedOutcomeSchema
    .describe('Expected outcome configuration'),
  duration: GoalDurationSchema
    .describe('Goal duration period'),
  interval: z.enum(['weekly', 'monthly', 'quarterly', 'yearly'], {
    errorMap: () => ({ message: 'Interval must be one of: weekly, monthly, quarterly, yearly' }),
  })
    .describe('Goal interval'),
}).strict();

export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;

/**
 * Schema for updating a goal
 */
export const UpdateGoalSchema = z.object({
  id: z.string()
    .min(1, 'Goal ID is required')
    .describe('ID of the goal to update'),
  title: z.string()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title cannot exceed 255 characters')
    .optional()
    .describe('Goal title'),
  type: GoalTypeSchema
    .optional()
    .describe('Goal type configuration'),
  assignee: GoalAssigneeSchema
    .optional()
    .describe('User or team assigned to this goal'),
  expected_outcome: ExpectedOutcomeSchema
    .optional()
    .describe('Expected outcome configuration'),
  duration: GoalDurationSchema
    .optional()
    .describe('Goal duration period'),
  interval: z.enum(['weekly', 'monthly', 'quarterly', 'yearly'], {
    errorMap: () => ({ message: 'Interval must be one of: weekly, monthly, quarterly, yearly' }),
  })
    .optional()
    .describe('Goal interval'),
}).strict();

export type UpdateGoalInput = z.infer<typeof UpdateGoalSchema>;

/**
 * Schema for getting a specific goal
 */
export const GetGoalSchema = z.object({
  id: z.string()
    .min(1, 'Goal ID is required')
    .describe('ID of the goal to retrieve'),
});

export type GetGoalInput = z.infer<typeof GetGoalSchema>;

/**
 * Schema for deleting a goal
 */
export const DeleteGoalSchema = z.object({
  id: z.string()
    .min(1, 'Goal ID is required')
    .describe('ID of the goal to delete'),
});

export type DeleteGoalInput = z.infer<typeof DeleteGoalSchema>;

/**
 * Schema for listing goals
 */
export const ListGoalsSchema = z.object({
  'type.name': z.string()
    .optional()
    .describe('Filter by goal type name'),
  title: z.string()
    .optional()
    .describe('Filter by goal title'),
  is_active: z.boolean()
    .optional()
    .describe('Filter by active status'),
  'assignee.id': OptionalIdSchema
    .describe('Filter by assignee ID'),
  'assignee.type': z.enum(['person', 'team'])
    .optional()
    .describe('Filter by assignee type'),
  'expected_outcome.target': z.number()
    .optional()
    .describe('Filter by target value'),
  'expected_outcome.tracking_metric': z.string()
    .optional()
    .describe('Filter by tracking metric'),
  'period.start': DateStringSchema
    .optional()
    .describe('Filter by period start date'),
  'period.end': DateStringSchema
    .optional()
    .describe('Filter by period end date'),
}).strict();

export type ListGoalsInput = z.infer<typeof ListGoalsSchema>;

/**
 * Schema for getting goal results
 */
export const GetGoalResultsSchema = z.object({
  id: z.string()
    .min(1, 'Goal ID is required')
    .describe('ID of the goal to get results for'),
  'period.start': DateStringSchema
    .describe('Period start date in YYYY-MM-DD format'),
  'period.end': DateStringSchema
    .describe('Period end date in YYYY-MM-DD format'),
});

export type GetGoalResultsInput = z.infer<typeof GetGoalResultsSchema>;
