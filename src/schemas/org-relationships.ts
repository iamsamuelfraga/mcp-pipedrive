import { z } from 'zod';
import { IdSchema } from './common.js';

/**
 * Schema for getting all organization relationships
 */
export const GetOrganizationRelationshipsSchema = z.object({
  org_id: IdSchema
    .describe('The ID of the organization to get relationships for'),
}).strict();

export type GetOrganizationRelationshipsInput = z.infer<typeof GetOrganizationRelationshipsSchema>;

/**
 * Schema for getting a single organization relationship
 */
export const GetOrganizationRelationshipSchema = z.object({
  id: IdSchema
    .describe('ID of the organization relationship'),
}).strict();

export type GetOrganizationRelationshipInput = z.infer<typeof GetOrganizationRelationshipSchema>;

/**
 * Schema for creating an organization relationship
 */
export const CreateOrganizationRelationshipSchema = z.object({
  type: z.string()
    .min(1, 'Type is required and cannot be empty')
    .describe('The type of the relationship (e.g., parent, daughter, related)'),
  rel_owner_org_id: IdSchema
    .describe('The owner organization ID'),
  rel_linked_org_id: IdSchema
    .describe('The linked organization ID'),
  org_id: IdSchema
    .describe('The ID of the base organization for the returned calculated values'),
}).strict();

export type CreateOrganizationRelationshipInput = z.infer<typeof CreateOrganizationRelationshipSchema>;

/**
 * Schema for updating an organization relationship
 */
export const UpdateOrganizationRelationshipSchema = z.object({
  id: IdSchema
    .describe('ID of the organization relationship to update'),
  type: z.string()
    .min(1, 'Type cannot be empty')
    .optional()
    .describe('The type of the relationship (e.g., parent, daughter, related)'),
  rel_owner_org_id: IdSchema
    .optional()
    .describe('The owner organization ID'),
  rel_linked_org_id: IdSchema
    .optional()
    .describe('The linked organization ID'),
  org_id: IdSchema
    .optional()
    .describe('The ID of the base organization for the returned calculated values'),
}).strict();

export type UpdateOrganizationRelationshipInput = z.infer<typeof UpdateOrganizationRelationshipSchema>;

/**
 * Schema for deleting an organization relationship
 */
export const DeleteOrganizationRelationshipSchema = z.object({
  id: IdSchema
    .describe('ID of the organization relationship to delete'),
}).strict();

export type DeleteOrganizationRelationshipInput = z.infer<typeof DeleteOrganizationRelationshipSchema>;
