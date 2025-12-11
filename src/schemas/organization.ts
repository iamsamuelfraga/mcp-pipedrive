import { z } from 'zod';
import {
  IdSchema,
  OptionalIdSchema,
  VisibilitySchema,
  PaginationSchema,
  SortDirectionSchema,
  BooleanLikeSchema,
} from './common.js';

/**
 * Schema for creating a new organization
 */
export const CreateOrganizationSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required and cannot be empty')
      .max(255, 'Name cannot exceed 255 characters')
      .describe('Organization name'),
    owner_id: OptionalIdSchema.describe('ID of the user who will be marked as the owner'),
    visible_to: VisibilitySchema.optional().describe('Visibility of the organization'),
    add_time: z.string().optional().describe('Creation time in ISO 8601 format'),
    label: OptionalIdSchema.describe('ID of the label to assign to the organization'),
    address: z
      .string()
      .max(255, 'Address cannot exceed 255 characters')
      .optional()
      .describe('Street address'),
    address_subpremise: z
      .string()
      .max(255, 'Address subpremise cannot exceed 255 characters')
      .optional()
      .describe('Apartment/suite number'),
    address_street_number: z
      .string()
      .max(50, 'Street number cannot exceed 50 characters')
      .optional()
      .describe('Street number'),
    address_route: z
      .string()
      .max(255, 'Route cannot exceed 255 characters')
      .optional()
      .describe('Street name'),
    address_sublocality: z
      .string()
      .max(255, 'Sublocality cannot exceed 255 characters')
      .optional()
      .describe('District/sublocality'),
    address_locality: z
      .string()
      .max(255, 'Locality cannot exceed 255 characters')
      .optional()
      .describe('City/locality'),
    address_admin_area_level_1: z
      .string()
      .max(255, 'Admin area level 1 cannot exceed 255 characters')
      .optional()
      .describe('State/province'),
    address_admin_area_level_2: z
      .string()
      .max(255, 'Admin area level 2 cannot exceed 255 characters')
      .optional()
      .describe('County/region'),
    address_country: z
      .string()
      .max(255, 'Country cannot exceed 255 characters')
      .optional()
      .describe('Country'),
    address_postal_code: z
      .string()
      .max(50, 'Postal code cannot exceed 50 characters')
      .optional()
      .describe('Postal/ZIP code'),
    address_formatted_address: z
      .string()
      .max(500, 'Formatted address cannot exceed 500 characters')
      .optional()
      .describe('Full formatted address'),
  })
  .strict();

export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;

/**
 * Schema for updating an existing organization
 */
export const UpdateOrganizationSchema = z
  .object({
    id: IdSchema.describe('ID of the organization to update'),
    name: z
      .string()
      .min(1, 'Name cannot be empty')
      .max(255, 'Name cannot exceed 255 characters')
      .optional()
      .describe('Organization name'),
    owner_id: OptionalIdSchema.describe('ID of the user who will be marked as the owner'),
    visible_to: VisibilitySchema.optional().describe('Visibility of the organization'),
    label: OptionalIdSchema.describe('ID of the label to assign to the organization'),
    address: z
      .string()
      .max(255, 'Address cannot exceed 255 characters')
      .optional()
      .describe('Street address'),
    address_subpremise: z
      .string()
      .max(255, 'Address subpremise cannot exceed 255 characters')
      .optional()
      .describe('Apartment/suite number'),
    address_street_number: z
      .string()
      .max(50, 'Street number cannot exceed 50 characters')
      .optional()
      .describe('Street number'),
    address_route: z
      .string()
      .max(255, 'Route cannot exceed 255 characters')
      .optional()
      .describe('Street name'),
    address_sublocality: z
      .string()
      .max(255, 'Sublocality cannot exceed 255 characters')
      .optional()
      .describe('District/sublocality'),
    address_locality: z
      .string()
      .max(255, 'Locality cannot exceed 255 characters')
      .optional()
      .describe('City/locality'),
    address_admin_area_level_1: z
      .string()
      .max(255, 'Admin area level 1 cannot exceed 255 characters')
      .optional()
      .describe('State/province'),
    address_admin_area_level_2: z
      .string()
      .max(255, 'Admin area level 2 cannot exceed 255 characters')
      .optional()
      .describe('County/region'),
    address_country: z
      .string()
      .max(255, 'Country cannot exceed 255 characters')
      .optional()
      .describe('Country'),
    address_postal_code: z
      .string()
      .max(50, 'Postal code cannot exceed 50 characters')
      .optional()
      .describe('Postal/ZIP code'),
    address_formatted_address: z
      .string()
      .max(500, 'Formatted address cannot exceed 500 characters')
      .optional()
      .describe('Full formatted address'),
  })
  .strict();

export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;

/**
 * Schema for listing organizations with filters
 */
export const ListOrganizationsSchema = PaginationSchema.extend({
  user_id: OptionalIdSchema.describe('Filter by user (owner) ID'),
  filter_id: OptionalIdSchema.describe('ID of the filter to use'),
  first_char: z
    .string()
    .length(1, 'First char must be a single character')
    .regex(/^[a-zA-Z]$/, 'First char must be a letter')
    .optional()
    .describe('Filter by first character of name'),
  sort: z.string().optional().describe('Field to sort by (e.g., name, address, owner_id)'),
  sort_by: SortDirectionSchema.optional().describe('Sort direction'),
}).strict();

export type ListOrganizationsInput = z.infer<typeof ListOrganizationsSchema>;

/**
 * Schema for searching organizations
 */
export const SearchOrganizationsSchema = z
  .object({
    term: z
      .string()
      .min(2, 'Search term must be at least 2 characters')
      .max(255, 'Search term cannot exceed 255 characters')
      .describe('Search term'),
    fields: z
      .enum(['name', 'address', 'notes', 'custom_fields', 'all'], {
        errorMap: () => ({
          message: 'Fields must be one of: name, address, notes, custom_fields, all',
        }),
      })
      .optional()
      .default('all')
      .describe('Fields to search in'),
    exact_match: BooleanLikeSchema.optional()
      .default(false)
      .describe('Whether to perform exact match search'),
    include_fields: z
      .string()
      .optional()
      .describe('Comma-separated list of fields to include in response'),
    start: z
      .number()
      .int('Start must be an integer')
      .nonnegative('Start must be non-negative')
      .default(0)
      .describe('Pagination start'),
    limit: z
      .number()
      .int('Limit must be an integer')
      .positive('Limit must be positive')
      .max(500, 'Limit cannot exceed 500')
      .optional()
      .describe('Number of items to return'),
  })
  .strict();

export type SearchOrganizationsInput = z.infer<typeof SearchOrganizationsSchema>;

/**
 * Schema for getting a single organization
 */
export const GetOrganizationSchema = z
  .object({
    id: IdSchema.describe('ID of the organization to retrieve'),
  })
  .strict();

export type GetOrganizationInput = z.infer<typeof GetOrganizationSchema>;

/**
 * Schema for deleting an organization
 */
export const DeleteOrganizationSchema = z
  .object({
    id: IdSchema.describe('ID of the organization to delete'),
  })
  .strict();

export type DeleteOrganizationInput = z.infer<typeof DeleteOrganizationSchema>;

/**
 * Schema for merging two organizations
 */
export const MergeOrganizationsSchema = z
  .object({
    id: IdSchema.describe('ID of the organization to keep'),
    merge_with_id: IdSchema.describe('ID of the organization to merge into the first one'),
  })
  .strict()
  .refine((data) => data.id !== data.merge_with_id, {
    message: 'Cannot merge an organization with itself',
    path: ['merge_with_id'],
  });

export type MergeOrganizationsInput = z.infer<typeof MergeOrganizationsSchema>;

/**
 * Schema for getting organization deals
 */
export const GetOrganizationDealsSchema = z
  .object({
    id: IdSchema.describe('ID of the organization'),
    start: z
      .number()
      .int('Start must be an integer')
      .nonnegative('Start must be non-negative')
      .default(0)
      .optional()
      .describe('Pagination start'),
    limit: z
      .number()
      .int('Limit must be an integer')
      .positive('Limit must be positive')
      .max(500, 'Limit cannot exceed 500')
      .optional()
      .describe('Number of items to return'),
    status: z
      .enum(['open', 'won', 'lost', 'deleted', 'all_not_deleted'], {
        errorMap: () => ({
          message: 'Status must be one of: open, won, lost, deleted, all_not_deleted',
        }),
      })
      .optional()
      .default('all_not_deleted')
      .describe('Filter by deal status'),
    sort: z.string().optional().describe('Field to sort by'),
  })
  .strict();

export type GetOrganizationDealsInput = z.infer<typeof GetOrganizationDealsSchema>;

/**
 * Schema for getting organization persons
 */
export const GetOrganizationPersonsSchema = z
  .object({
    id: IdSchema.describe('ID of the organization'),
    start: z
      .number()
      .int('Start must be an integer')
      .nonnegative('Start must be non-negative')
      .default(0)
      .optional()
      .describe('Pagination start'),
    limit: z
      .number()
      .int('Limit must be an integer')
      .positive('Limit must be positive')
      .max(500, 'Limit cannot exceed 500')
      .optional()
      .describe('Number of items to return'),
  })
  .strict();

export type GetOrganizationPersonsInput = z.infer<typeof GetOrganizationPersonsSchema>;

/**
 * Schema for getting organization followers
 */
export const GetOrganizationFollowersSchema = z
  .object({
    id: IdSchema.describe('ID of the organization'),
  })
  .strict();

export type GetOrganizationFollowersInput = z.infer<typeof GetOrganizationFollowersSchema>;

/**
 * Schema for adding a follower to an organization
 */
export const AddOrganizationFollowerSchema = z
  .object({
    id: IdSchema.describe('ID of the organization'),
    user_id: IdSchema.describe('ID of the user to add as a follower'),
  })
  .strict();

export type AddOrganizationFollowerInput = z.infer<typeof AddOrganizationFollowerSchema>;

/**
 * Schema for removing a follower from an organization
 */
export const RemoveOrganizationFollowerSchema = z
  .object({
    id: IdSchema.describe('ID of the organization'),
    follower_id: IdSchema.describe('ID of the follower to remove'),
  })
  .strict();

export type RemoveOrganizationFollowerInput = z.infer<typeof RemoveOrganizationFollowerSchema>;

/**
 * Schema for listing organization activities
 */
export const GetOrganizationActivitiesSchema = z
  .object({
    id: IdSchema.describe('ID of the organization'),
    start: z
      .number()
      .int('Start must be an integer')
      .nonnegative('Start must be non-negative')
      .default(0)
      .optional()
      .describe('Pagination start'),
    limit: z
      .number()
      .int('Limit must be an integer')
      .positive('Limit must be positive')
      .max(500, 'Limit cannot exceed 500')
      .optional()
      .describe('Number of items to return'),
    done: BooleanLikeSchema.optional().describe('Filter by completion status'),
  })
  .strict();

export type GetOrganizationActivitiesInput = z.infer<typeof GetOrganizationActivitiesSchema>;

/**
 * Schema for getting organization files
 */
export const GetOrganizationFilesSchema = z
  .object({
    id: IdSchema.describe('ID of the organization'),
    start: z
      .number()
      .int('Start must be an integer')
      .nonnegative('Start must be non-negative')
      .default(0)
      .optional()
      .describe('Pagination start'),
    limit: z
      .number()
      .int('Limit must be an integer')
      .positive('Limit must be positive')
      .max(500, 'Limit cannot exceed 500')
      .optional()
      .describe('Number of items to return'),
  })
  .strict();

export type GetOrganizationFilesInput = z.infer<typeof GetOrganizationFilesSchema>;

/**
 * Schema for getting organization mail messages
 */
export const GetOrganizationMailMessagesSchema = z
  .object({
    id: IdSchema.describe('ID of the organization'),
    start: z
      .number()
      .int('Start must be an integer')
      .nonnegative('Start must be non-negative')
      .default(0)
      .optional()
      .describe('Pagination start'),
    limit: z
      .number()
      .int('Limit must be an integer')
      .positive('Limit must be positive')
      .max(500, 'Limit cannot exceed 500')
      .optional()
      .describe('Number of items to return'),
  })
  .strict();

export type GetOrganizationMailMessagesInput = z.infer<typeof GetOrganizationMailMessagesSchema>;

/**
 * Schema for getting organization changelog (field updates)
 */
export const GetOrganizationChangelogSchema = z
  .object({
    id: IdSchema.describe('ID of the organization'),
    cursor: z.string().optional().describe('Cursor for pagination'),
    limit: z
      .number()
      .int('Limit must be an integer')
      .positive('Limit must be positive')
      .max(500, 'Limit cannot exceed 500')
      .optional()
      .describe('Number of items to return'),
  })
  .strict();

export type GetOrganizationChangelogInput = z.infer<typeof GetOrganizationChangelogSchema>;

/**
 * Schema for getting organization flow (activity stream)
 */
export const GetOrganizationFlowSchema = z
  .object({
    id: IdSchema.describe('ID of the organization'),
    start: z
      .number()
      .int('Start must be an integer')
      .nonnegative('Start must be non-negative')
      .default(0)
      .optional()
      .describe('Pagination start'),
    limit: z
      .number()
      .int('Limit must be an integer')
      .positive('Limit must be positive')
      .max(500, 'Limit cannot exceed 500')
      .optional()
      .describe('Number of items to return'),
    all_changes: z.string().optional().describe('Whether to show all field changes'),
    items: z.string().optional().describe('Types of items to include in the flow'),
  })
  .strict();

export type GetOrganizationFlowInput = z.infer<typeof GetOrganizationFlowSchema>;

/**
 * Schema for getting organization permitted users
 */
export const GetOrganizationPermittedUsersSchema = z
  .object({
    id: IdSchema.describe('ID of the organization'),
  })
  .strict();

export type GetOrganizationPermittedUsersInput = z.infer<
  typeof GetOrganizationPermittedUsersSchema
>;

/**
 * Schema for bulk deleting organizations
 */
export const BulkDeleteOrganizationsSchema = z
  .object({
    ids: z
      .string()
      .regex(/^\d+(,\d+)*$/, 'IDs must be a comma-separated list of numbers')
      .describe('Comma-separated list of organization IDs to delete'),
  })
  .strict();

export type BulkDeleteOrganizationsInput = z.infer<typeof BulkDeleteOrganizationsSchema>;

/**
 * Schema for getting organizations collection (cursor-based pagination)
 */
export const GetOrganizationsCollectionSchema = z
  .object({
    cursor: z.string().optional().describe('Cursor for pagination'),
    limit: z
      .number()
      .int('Limit must be an integer')
      .positive('Limit must be positive')
      .max(500, 'Limit cannot exceed 500')
      .default(100)
      .optional()
      .describe('Number of items to return'),
    since: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional()
      .describe('Filter organizations modified after this date'),
    until: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional()
      .describe('Filter organizations modified before this date'),
    owner_id: OptionalIdSchema.describe('Filter by owner user ID'),
    first_char: z
      .string()
      .length(1, 'First char must be a single character')
      .regex(/^[a-zA-Z]$/, 'First char must be a letter')
      .optional()
      .describe('Filter by first character of name'),
  })
  .strict();

export type GetOrganizationsCollectionInput = z.infer<typeof GetOrganizationsCollectionSchema>;
