import { z } from 'zod';
import { IdSchema } from './common.js';

/**
 * Schema for creating a new activity type
 */
export const CreateActivityTypeSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required and cannot be empty')
      .max(128, 'Name cannot exceed 128 characters')
      .describe('Activity type name'),
    icon_key: z
      .string()
      .min(1, 'Icon key is required')
      .describe('Icon identifier (e.g., task, call, meeting, deadline, email, lunch)'),
    color: z
      .string()
      .regex(/^[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code without # (e.g., FFFFFF)')
      .optional()
      .describe('Color as a 6-character hex code without # (e.g., FFFFFF)'),
  })
  .strict();

export type CreateActivityTypeInput = z.infer<typeof CreateActivityTypeSchema>;

/**
 * Schema for updating an activity type
 */
export const UpdateActivityTypeSchema = z
  .object({
    id: IdSchema.describe('ID of the activity type to update'),
    name: z
      .string()
      .min(1, 'Name cannot be empty')
      .max(128, 'Name cannot exceed 128 characters')
      .optional()
      .describe('Activity type name'),
    icon_key: z
      .string()
      .min(1, 'Icon key cannot be empty')
      .optional()
      .describe('Icon identifier (e.g., task, call, meeting, deadline, email, lunch)'),
    color: z
      .string()
      .regex(/^[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code without # (e.g., FFFFFF)')
      .optional()
      .describe('Color as a 6-character hex code without # (e.g., FFFFFF)'),
    order_nr: z
      .number()
      .int('Order number must be an integer')
      .nonnegative('Order number must be non-negative')
      .optional()
      .describe('Order number for display sorting'),
  })
  .strict();

export type UpdateActivityTypeInput = z.infer<typeof UpdateActivityTypeSchema>;

/**
 * Schema for deleting an activity type
 */
export const DeleteActivityTypeSchema = z.object({
  id: IdSchema.describe('ID of the activity type to delete'),
});

export type DeleteActivityTypeInput = z.infer<typeof DeleteActivityTypeSchema>;

/**
 * Schema for deleting multiple activity types in bulk
 */
export const BulkDeleteActivityTypesSchema = z.object({
  ids: z
    .string()
    .min(1, 'IDs are required')
    .describe('Comma-separated activity type IDs to delete (e.g., "1,2,3")'),
});

export type BulkDeleteActivityTypesInput = z.infer<typeof BulkDeleteActivityTypesSchema>;

/**
 * Schema for listing all activity types
 * Note: This endpoint doesn't accept parameters according to the API
 */
export const ListActivityTypesSchema = z.object({}).strict();

export type ListActivityTypesInput = z.infer<typeof ListActivityTypesSchema>;
