import { z } from 'zod';
import { IdSchema, BooleanLikeSchema } from './common.js';

/**
 * Schema for getting all teams
 */
export const GetAllTeamsSchema = z.object({
  order_by: z.string()
    .optional()
    .describe('The field name to sort returned teams by'),
  skip_users: BooleanLikeSchema
    .optional()
    .default(false)
    .describe('When enabled, the teams will not include IDs of member users'),
}).strict();

export type GetAllTeamsInput = z.infer<typeof GetAllTeamsSchema>;

/**
 * Schema for getting a single team
 */
export const GetTeamSchema = z.object({
  id: IdSchema
    .describe('ID of the team'),
  skip_users: BooleanLikeSchema
    .optional()
    .default(false)
    .describe('When enabled, the team will not include IDs of member users'),
}).strict();

export type GetTeamInput = z.infer<typeof GetTeamSchema>;

/**
 * Schema for creating a new team
 */
export const CreateTeamSchema = z.object({
  name: z.string()
    .min(1, 'Name is required and cannot be empty')
    .max(255, 'Name cannot exceed 255 characters')
    .describe('Team name'),
  manager_id: IdSchema
    .describe('ID of the user who will be the manager of this team'),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .describe('Team description'),
  users: z.array(z.number())
    .optional()
    .describe('Array of user IDs to add to the team'),
}).strict();

export type CreateTeamInput = z.infer<typeof CreateTeamSchema>;

/**
 * Schema for updating a team
 */
export const UpdateTeamSchema = z.object({
  id: IdSchema
    .describe('ID of the team to update'),
  name: z.string()
    .min(1, 'Name cannot be empty')
    .max(255, 'Name cannot exceed 255 characters')
    .optional()
    .describe('Team name'),
  manager_id: IdSchema
    .optional()
    .describe('ID of the user who will be the manager of this team'),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .describe('Team description'),
  users: z.array(z.number())
    .optional()
    .describe('Array of user IDs to add to the team'),
  active_flag: BooleanLikeSchema
    .optional()
    .describe('Whether the team is active'),
}).strict();

export type UpdateTeamInput = z.infer<typeof UpdateTeamSchema>;

/**
 * Schema for getting team users
 */
export const GetTeamUsersSchema = z.object({
  id: IdSchema
    .describe('ID of the team'),
}).strict();

export type GetTeamUsersInput = z.infer<typeof GetTeamUsersSchema>;

/**
 * Schema for adding a user to a team
 */
export const AddUserToTeamSchema = z.object({
  id: IdSchema
    .describe('ID of the team'),
  user_id: IdSchema
    .describe('ID of the user to add to the team'),
}).strict();

export type AddUserToTeamInput = z.infer<typeof AddUserToTeamSchema>;

/**
 * Schema for deleting a user from a team
 */
export const DeleteUserFromTeamSchema = z.object({
  id: IdSchema
    .describe('ID of the team'),
  user_id: IdSchema
    .describe('ID of the user to remove from the team'),
}).strict();

export type DeleteUserFromTeamInput = z.infer<typeof DeleteUserFromTeamSchema>;

/**
 * Schema for getting teams of a user
 */
export const GetUserTeamsSchema = z.object({
  id: IdSchema
    .describe('ID of the user'),
  order_by: z.string()
    .optional()
    .describe('The field name to sort returned teams by'),
  skip_users: BooleanLikeSchema
    .optional()
    .default(false)
    .describe('When enabled, the teams will not include IDs of member users'),
}).strict();

export type GetUserTeamsInput = z.infer<typeof GetUserTeamsSchema>;
