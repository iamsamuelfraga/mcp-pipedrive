import { z } from 'zod';
import { IdSchema, BooleanLikeSchema } from './common.js';

/**
 * Schema for listing all users
 */
export const ListUsersSchema = z.object({}).strict();

export type ListUsersInput = z.infer<typeof ListUsersSchema>;

/**
 * Schema for getting a single user
 */
export const GetUserSchema = z.object({
  id: IdSchema.describe('ID of the user to retrieve'),
}).strict();

export type GetUserInput = z.infer<typeof GetUserSchema>;

/**
 * Schema for adding a new user
 */
export const AddUserSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name cannot exceed 255 characters')
    .describe('Name of the user'),
  email: z.string()
    .email('Invalid email format')
    .describe('Email address of the user'),
  active_flag: BooleanLikeSchema
    .optional()
    .default(true)
    .describe('Whether the user is active'),
}).strict();

export type AddUserInput = z.infer<typeof AddUserSchema>;

/**
 * Schema for updating user details
 */
export const UpdateUserSchema = z.object({
  id: IdSchema.describe('ID of the user to update'),
  name: z.string()
    .min(1, 'Name cannot be empty')
    .max(255, 'Name cannot exceed 255 characters')
    .optional()
    .describe('Name of the user'),
  email: z.string()
    .email('Invalid email format')
    .optional()
    .describe('Email address of the user'),
  active_flag: BooleanLikeSchema
    .optional()
    .describe('Whether the user is active'),
}).strict();

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/**
 * Schema for getting current user
 */
export const GetCurrentUserSchema = z.object({}).strict();

export type GetCurrentUserInput = z.infer<typeof GetCurrentUserSchema>;

/**
 * Schema for listing user followers
 */
export const ListUserFollowersSchema = z.object({
  id: IdSchema.describe('ID of the user'),
}).strict();

export type ListUserFollowersInput = z.infer<typeof ListUserFollowersSchema>;

/**
 * Schema for adding a follower to a user
 */
export const AddUserFollowerSchema = z.object({
  id: IdSchema.describe('ID of the user'),
  user_id: IdSchema.describe('ID of the user to add as follower'),
}).strict();

export type AddUserFollowerInput = z.infer<typeof AddUserFollowerSchema>;

/**
 * Schema for deleting a follower from a user
 */
export const DeleteUserFollowerSchema = z.object({
  id: IdSchema.describe('ID of the user'),
  follower_id: IdSchema.describe('ID of the follower to remove'),
}).strict();

export type DeleteUserFollowerInput = z.infer<typeof DeleteUserFollowerSchema>;

/**
 * Schema for getting user permissions
 */
export const GetUserPermissionsSchema = z.object({
  id: IdSchema.describe('ID of the user'),
}).strict();

export type GetUserPermissionsInput = z.infer<typeof GetUserPermissionsSchema>;

/**
 * Schema for listing user role settings
 */
export const ListUserRoleSettingsSchema = z.object({
  id: IdSchema.describe('ID of the user'),
}).strict();

export type ListUserRoleSettingsInput = z.infer<typeof ListUserRoleSettingsSchema>;

/**
 * Schema for finding users by name
 */
export const FindUsersSchema = z.object({
  term: z.string()
    .min(1, 'Search term is required')
    .describe('Search term to find users by name'),
  search_by_email: BooleanLikeSchema
    .optional()
    .describe('Whether to search by email address instead of name'),
}).strict();

export type FindUsersInput = z.infer<typeof FindUsersSchema>;

/**
 * Schema for listing user role assignments
 */
export const ListUserRoleAssignmentsSchema = z.object({
  id: IdSchema.describe('ID of the user'),
  start: z.number()
    .int()
    .nonnegative()
    .optional()
    .describe('Pagination start'),
  limit: z.number()
    .int()
    .positive()
    .max(500)
    .optional()
    .describe('Number of items to return (max 500)'),
}).strict();

export type ListUserRoleAssignmentsInput = z.infer<typeof ListUserRoleAssignmentsSchema>;
