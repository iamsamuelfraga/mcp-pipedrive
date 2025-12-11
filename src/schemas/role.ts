import { z } from 'zod';
import { IdSchema, OptionalIdSchema, PaginationSchema } from './common.js';

/**
 * Schema for listing all roles
 */
export const ListRolesSchema = PaginationSchema.extend({}).strict();

export type ListRolesInput = z.infer<typeof ListRolesSchema>;

/**
 * Schema for getting a single role
 */
export const GetRoleSchema = z
  .object({
    id: IdSchema.describe('ID of the role to retrieve'),
  })
  .strict();

export type GetRoleInput = z.infer<typeof GetRoleSchema>;

/**
 * Schema for adding a new role
 */
export const AddRoleSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(255, 'Name cannot exceed 255 characters')
      .describe('Name of the role'),
    parent_role_id: OptionalIdSchema.describe('ID of the parent role'),
  })
  .strict();

export type AddRoleInput = z.infer<typeof AddRoleSchema>;

/**
 * Schema for updating role details
 */
export const UpdateRoleSchema = z
  .object({
    id: IdSchema.describe('ID of the role to update'),
    name: z
      .string()
      .min(1, 'Name cannot be empty')
      .max(255, 'Name cannot exceed 255 characters')
      .optional()
      .describe('Name of the role'),
    parent_role_id: OptionalIdSchema.describe('ID of the parent role'),
  })
  .strict();

export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;

/**
 * Schema for deleting a role
 */
export const DeleteRoleSchema = z
  .object({
    id: IdSchema.describe('ID of the role to delete'),
  })
  .strict();

export type DeleteRoleInput = z.infer<typeof DeleteRoleSchema>;

/**
 * Schema for getting role assignments
 */
export const GetRoleAssignmentsSchema = PaginationSchema.extend({
  id: IdSchema.describe('ID of the role'),
}).strict();

export type GetRoleAssignmentsInput = z.infer<typeof GetRoleAssignmentsSchema>;

/**
 * Schema for adding a role assignment
 */
export const AddRoleAssignmentSchema = z
  .object({
    id: IdSchema.describe('ID of the role'),
    user_id: IdSchema.describe('ID of the user to assign the role to'),
  })
  .strict();

export type AddRoleAssignmentInput = z.infer<typeof AddRoleAssignmentSchema>;

/**
 * Schema for deleting a role assignment
 */
export const DeleteRoleAssignmentSchema = z
  .object({
    id: IdSchema.describe('ID of the role'),
    user_id: IdSchema.describe('ID of the user to remove the role assignment from'),
  })
  .strict();

export type DeleteRoleAssignmentInput = z.infer<typeof DeleteRoleAssignmentSchema>;

/**
 * Schema for getting role settings
 */
export const GetRoleSettingsSchema = z
  .object({
    id: IdSchema.describe('ID of the role'),
  })
  .strict();

export type GetRoleSettingsInput = z.infer<typeof GetRoleSettingsSchema>;

/**
 * Schema for adding or updating a role setting
 */
export const AddRoleSettingSchema = z
  .object({
    id: IdSchema.describe('ID of the role'),
    setting_key: z.string().min(1, 'Setting key is required').describe('Key of the setting'),
    value: z.union([z.string(), z.number(), z.boolean()]).describe('Value of the setting'),
  })
  .strict();

export type AddRoleSettingInput = z.infer<typeof AddRoleSettingSchema>;

/**
 * Schema for updating a role setting
 */
export const UpdateRoleSettingSchema = z
  .object({
    id: IdSchema.describe('ID of the role'),
    setting_key: z.string().min(1, 'Setting key is required').describe('Key of the setting'),
    value: z.union([z.string(), z.number(), z.boolean()]).describe('Value of the setting'),
  })
  .strict();

export type UpdateRoleSettingInput = z.infer<typeof UpdateRoleSettingSchema>;

/**
 * Schema for deleting a role setting
 */
export const DeleteRoleSettingSchema = z
  .object({
    id: IdSchema.describe('ID of the role'),
    setting_key: z
      .string()
      .min(1, 'Setting key is required')
      .describe('Key of the setting to delete'),
  })
  .strict();

export type DeleteRoleSettingInput = z.infer<typeof DeleteRoleSettingSchema>;

/**
 * Schema for listing pipeline visibility for a role
 */
export const ListRolePipelinesSchema = z
  .object({
    id: IdSchema.describe('ID of the role'),
    visible: z.boolean().optional().describe('Whether to fetch only visible pipelines'),
  })
  .strict();

export type ListRolePipelinesInput = z.infer<typeof ListRolePipelinesSchema>;

/**
 * Schema for updating pipeline visibility for a role
 */
export const UpdateRolePipelinesSchema = z
  .object({
    id: IdSchema.describe('ID of the role'),
    visible_pipeline_ids: z
      .record(z.number())
      .describe('Object where keys are pipeline IDs and values are 1 (visible) or 0 (hidden)'),
  })
  .strict();

export type UpdateRolePipelinesInput = z.infer<typeof UpdateRolePipelinesSchema>;
