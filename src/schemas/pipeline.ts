import { z } from 'zod';
import { IdSchema, OptionalIdSchema } from './common.js';

/**
 * Schema for creating a pipeline
 */
export const CreatePipelineSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Pipeline name is required')
      .max(255, 'Pipeline name cannot exceed 255 characters')
      .describe('Pipeline name'),
    order_nr: z
      .number()
      .int('Order must be an integer')
      .nonnegative('Order must be non-negative')
      .optional()
      .describe('Order number of the pipeline'),
    active: z.boolean().optional().default(true).describe('Whether the pipeline is active'),
    deal_probability: z
      .boolean()
      .optional()
      .default(true)
      .describe('Whether deal probability is enabled for this pipeline'),
  })
  .strict();

export type CreatePipelineInput = z.infer<typeof CreatePipelineSchema>;

/**
 * Schema for getting a single pipeline
 */
export const GetPipelineSchema = z
  .object({
    id: IdSchema.describe('ID of the pipeline to retrieve'),
    totals_convert_currency: z
      .string()
      .length(3, 'Currency must be a 3-letter ISO code')
      .optional()
      .describe('3-letter currency code to convert totals to'),
  })
  .strict();

export type GetPipelineInput = z.infer<typeof GetPipelineSchema>;

/**
 * Schema for updating a pipeline
 */
export const UpdatePipelineSchema = z
  .object({
    id: IdSchema.describe('ID of the pipeline to update'),
    name: z
      .string()
      .min(1, 'Pipeline name cannot be empty')
      .max(255, 'Pipeline name cannot exceed 255 characters')
      .optional()
      .describe('Pipeline name'),
    order_nr: z
      .number()
      .int('Order must be an integer')
      .nonnegative('Order must be non-negative')
      .optional()
      .describe('Order number of the pipeline'),
    active: z.boolean().optional().describe('Whether the pipeline is active'),
    deal_probability: z
      .boolean()
      .optional()
      .describe('Whether deal probability is enabled for this pipeline'),
  })
  .strict();

export type UpdatePipelineInput = z.infer<typeof UpdatePipelineSchema>;

/**
 * Schema for deleting a pipeline
 */
export const DeletePipelineSchema = z
  .object({
    id: IdSchema.describe('ID of the pipeline to delete'),
  })
  .strict();

export type DeletePipelineInput = z.infer<typeof DeletePipelineSchema>;

/**
 * Schema for getting stages of a pipeline
 */
export const GetPipelineStagesSchema = z
  .object({
    id: IdSchema.describe('ID of the pipeline'),
  })
  .strict();

export type GetPipelineStagesInput = z.infer<typeof GetPipelineStagesSchema>;

/**
 * Schema for creating a stage
 */
export const CreateStageSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Stage name is required')
      .max(255, 'Stage name cannot exceed 255 characters')
      .describe('Stage name'),
    pipeline_id: IdSchema.describe('ID of the pipeline this stage belongs to'),
    order_nr: z
      .number()
      .int('Order must be an integer')
      .nonnegative('Order must be non-negative')
      .optional()
      .describe('Order number of the stage'),
    deal_probability: z
      .number()
      .int('Probability must be an integer')
      .min(0, 'Probability must be between 0 and 100')
      .max(100, 'Probability must be between 0 and 100')
      .optional()
      .describe('Deal success probability (0-100)'),
    rotten_flag: z.boolean().optional().describe('Whether to enable rotten deals in this stage'),
    rotten_days: z
      .number()
      .int('Rotten days must be an integer')
      .positive('Rotten days must be positive')
      .optional()
      .describe('Number of days until a deal becomes rotten'),
  })
  .strict();

export type CreateStageInput = z.infer<typeof CreateStageSchema>;

/**
 * Schema for updating a stage
 */
export const UpdateStageSchema = z
  .object({
    id: IdSchema.describe('ID of the stage to update'),
    name: z
      .string()
      .min(1, 'Stage name cannot be empty')
      .max(255, 'Stage name cannot exceed 255 characters')
      .optional()
      .describe('Stage name'),
    order_nr: z
      .number()
      .int('Order must be an integer')
      .nonnegative('Order must be non-negative')
      .optional()
      .describe('Order number of the stage'),
    deal_probability: z
      .number()
      .int('Probability must be an integer')
      .min(0, 'Probability must be between 0 and 100')
      .max(100, 'Probability must be between 0 and 100')
      .optional()
      .describe('Deal success probability (0-100)'),
    rotten_flag: z.boolean().optional().describe('Whether to enable rotten deals in this stage'),
    rotten_days: z
      .number()
      .int('Rotten days must be an integer')
      .positive('Rotten days must be positive')
      .optional()
      .describe('Number of days until a deal becomes rotten'),
    pipeline_id: OptionalIdSchema.describe(
      'ID of the pipeline (to move stage to different pipeline)'
    ),
  })
  .strict();

export type UpdateStageInput = z.infer<typeof UpdateStageSchema>;

/**
 * Schema for deleting a stage
 */
export const DeleteStageSchema = z
  .object({
    id: IdSchema.describe('ID of the stage to delete'),
  })
  .strict();

export type DeleteStageInput = z.infer<typeof DeleteStageSchema>;

/**
 * Schema for getting a single stage
 */
export const GetStageSchema = z
  .object({
    id: IdSchema.describe('ID of the stage to retrieve'),
  })
  .strict();

export type GetStageInput = z.infer<typeof GetStageSchema>;

/**
 * Schema for getting all stages
 */
export const GetAllStagesSchema = z
  .object({
    pipeline_id: OptionalIdSchema.describe(
      'Filter stages by pipeline ID (optional, if omitted returns all stages)'
    ),
  })
  .strict();

export type GetAllStagesInput = z.infer<typeof GetAllStagesSchema>;

/**
 * Schema for deleting multiple stages in bulk
 */
export const DeleteMultipleStagesSchema = z
  .object({
    ids: z
      .string()
      .min(1, 'At least one stage ID is required')
      .describe('Comma-separated stage IDs to delete'),
  })
  .strict();

export type DeleteMultipleStagesInput = z.infer<typeof DeleteMultipleStagesSchema>;

/**
 * Schema for getting pipeline conversion statistics
 */
export const GetPipelineConversionStatisticsSchema = z
  .object({
    id: IdSchema.describe('ID of the pipeline'),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .describe('Start date of the period (YYYY-MM-DD)'),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .describe('End date of the period (YYYY-MM-DD)'),
    user_id: z
      .number()
      .int('User ID must be an integer')
      .positive('User ID must be positive')
      .optional()
      .describe('ID of the user to fetch statistics for (defaults to authorized user)'),
  })
  .strict();

export type GetPipelineConversionStatisticsInput = z.infer<
  typeof GetPipelineConversionStatisticsSchema
>;

/**
 * Schema for getting pipeline movement statistics
 */
export const GetPipelineMovementStatisticsSchema = z
  .object({
    id: IdSchema.describe('ID of the pipeline'),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .describe('Start date of the period (YYYY-MM-DD)'),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .describe('End date of the period (YYYY-MM-DD)'),
    user_id: z
      .number()
      .int('User ID must be an integer')
      .positive('User ID must be positive')
      .optional()
      .describe('ID of the user to fetch statistics for (defaults to authorized user)'),
  })
  .strict();

export type GetPipelineMovementStatisticsInput = z.infer<
  typeof GetPipelineMovementStatisticsSchema
>;

/**
 * Schema for getting deals in a pipeline
 */
export const GetPipelineDealsSchema = z
  .object({
    id: IdSchema.describe('ID of the pipeline'),
    filter_id: z
      .number()
      .int('Filter ID must be an integer')
      .positive('Filter ID must be positive')
      .optional()
      .describe('Only return deals matching this filter'),
    user_id: z
      .number()
      .int('User ID must be an integer')
      .positive('User ID must be positive')
      .optional()
      .describe('Only return deals owned by this user (defaults to authorized user)'),
    everyone: z
      .number()
      .optional()
      .describe('If supplied, return deals owned by everyone (ignores filter_id and user_id)'),
    stage_id: z
      .number()
      .int('Stage ID must be an integer')
      .positive('Stage ID must be positive')
      .optional()
      .describe('Only return deals in this stage'),
    start: z
      .number()
      .int('Start must be an integer')
      .nonnegative('Start must be non-negative')
      .optional()
      .default(0)
      .describe('Pagination start (defaults to 0)'),
    limit: z
      .number()
      .int('Limit must be an integer')
      .positive('Limit must be positive')
      .optional()
      .describe('Number of items per page'),
    get_summary: z.number().optional().describe('Include pipeline summary in additional_data'),
    totals_convert_currency: z
      .string()
      .optional()
      .describe('3-letter currency code for conversion (or "default_currency")'),
  })
  .strict();

export type GetPipelineDealsInput = z.infer<typeof GetPipelineDealsSchema>;
