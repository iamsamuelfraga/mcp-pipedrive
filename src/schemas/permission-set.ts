import { z } from 'zod';
import { PaginationSchema } from './common.js';

/**
 * Schema for listing all permission sets
 */
export const ListPermissionSetsSchema = z
  .object({
    app: z
      .string()
      .optional()
      .describe('The app to filter the permission sets by (e.g., sales, global, account_settings)'),
  })
  .strict();

export type ListPermissionSetsInput = z.infer<typeof ListPermissionSetsSchema>;

/**
 * Schema for getting a single permission set
 */
export const GetPermissionSetSchema = z
  .object({
    id: z.string().min(1, 'ID is required').describe('ID of the permission set (UUID)'),
  })
  .strict();

export type GetPermissionSetInput = z.infer<typeof GetPermissionSetSchema>;

/**
 * Schema for getting permission set assignments
 */
export const GetPermissionSetAssignmentsSchema = PaginationSchema.extend({
  id: z.string().min(1, 'ID is required').describe('ID of the permission set (UUID)'),
}).strict();

export type GetPermissionSetAssignmentsInput = z.infer<typeof GetPermissionSetAssignmentsSchema>;
