import { z } from 'zod';
import {
  IdSchema,
  OptionalIdSchema,
  EmailSchema,
  PhoneSchema,
  VisibilitySchema,
  MarketingStatusSchema,
  PaginationSchema,
  SortDirectionSchema,
  BooleanLikeSchema,
} from './common.js';

/**
 * Schema for creating a new person
 */
export const CreatePersonSchema = z.object({
  name: z.string()
    .min(1, 'Name is required and cannot be empty')
    .max(255, 'Name cannot exceed 255 characters')
    .describe('Person name'),
  owner_id: OptionalIdSchema
    .describe('ID of the user who will be marked as the owner'),
  org_id: OptionalIdSchema
    .describe('ID of the organization this person belongs to'),
  email: EmailSchema
    .optional()
    .describe('Email addresses associated with the person'),
  phone: PhoneSchema
    .optional()
    .describe('Phone numbers associated with the person'),
  visible_to: VisibilitySchema
    .optional()
    .describe('Visibility of the person'),
  marketing_status: MarketingStatusSchema
    .optional()
    .describe('Marketing consent status'),
  add_time: z.string()
    .optional()
    .describe('Creation time in ISO 8601 format'),
}).strict();

export type CreatePersonInput = z.infer<typeof CreatePersonSchema>;

/**
 * Schema for updating an existing person
 */
export const UpdatePersonSchema = z.object({
  id: IdSchema
    .describe('ID of the person to update'),
  name: z.string()
    .min(1, 'Name cannot be empty')
    .max(255, 'Name cannot exceed 255 characters')
    .optional()
    .describe('Person name'),
  owner_id: OptionalIdSchema
    .describe('ID of the user who will be marked as the owner'),
  org_id: OptionalIdSchema
    .describe('ID of the organization this person belongs to'),
  email: EmailSchema
    .optional()
    .describe('Email addresses associated with the person'),
  phone: PhoneSchema
    .optional()
    .describe('Phone numbers associated with the person'),
  visible_to: VisibilitySchema
    .optional()
    .describe('Visibility of the person'),
  marketing_status: MarketingStatusSchema
    .optional()
    .describe('Marketing consent status'),
}).strict();

export type UpdatePersonInput = z.infer<typeof UpdatePersonSchema>;

/**
 * Schema for listing persons with filters
 */
export const ListPersonsSchema = PaginationSchema.extend({
  user_id: OptionalIdSchema
    .describe('Filter by user (owner) ID'),
  org_id: OptionalIdSchema
    .describe('Filter by organization ID'),
  filter_id: OptionalIdSchema
    .describe('ID of the filter to use'),
  first_char: z.string()
    .length(1, 'First char must be a single character')
    .regex(/^[a-zA-Z]$/, 'First char must be a letter')
    .optional()
    .describe('Filter by first character of name'),
  sort: z.string()
    .optional()
    .describe('Field to sort by (e.g., name, email, org_id)'),
  sort_by: SortDirectionSchema
    .optional()
    .describe('Sort direction'),
}).strict();

export type ListPersonsInput = z.infer<typeof ListPersonsSchema>;

/**
 * Schema for searching persons
 */
export const SearchPersonsSchema = z.object({
  term: z.string()
    .min(2, 'Search term must be at least 2 characters')
    .max(255, 'Search term cannot exceed 255 characters')
    .describe('Search term'),
  fields: z.enum(['name', 'email', 'phone', 'notes', 'custom_fields', 'all'], {
    errorMap: () => ({ message: 'Fields must be one of: name, email, phone, notes, custom_fields, all' }),
  })
    .optional()
    .default('all')
    .describe('Fields to search in'),
  exact_match: BooleanLikeSchema
    .optional()
    .default(false)
    .describe('Whether to perform exact match search'),
  org_id: OptionalIdSchema
    .describe('Filter by organization ID'),
  include_fields: z.string()
    .optional()
    .describe('Comma-separated list of fields to include in response'),
  start: z.number()
    .int('Start must be an integer')
    .nonnegative('Start must be non-negative')
    .default(0)
    .describe('Pagination start'),
  limit: z.number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(500, 'Limit cannot exceed 500')
    .optional()
    .describe('Number of items to return'),
}).strict();

export type SearchPersonsInput = z.infer<typeof SearchPersonsSchema>;

/**
 * Schema for getting a single person
 */
export const GetPersonSchema = z.object({
  id: IdSchema
    .describe('ID of the person to retrieve'),
}).strict();

export type GetPersonInput = z.infer<typeof GetPersonSchema>;

/**
 * Schema for deleting a person
 */
export const DeletePersonSchema = z.object({
  id: IdSchema
    .describe('ID of the person to delete'),
}).strict();

export type DeletePersonInput = z.infer<typeof DeletePersonSchema>;

/**
 * Schema for merging two persons
 */
export const MergePersonsSchema = z.object({
  id: IdSchema
    .describe('ID of the person to keep'),
  merge_with_id: IdSchema
    .describe('ID of the person to merge into the first one'),
}).strict().refine(
  (data) => data.id !== data.merge_with_id,
  {
    message: 'Cannot merge a person with itself',
    path: ['merge_with_id'],
  }
);

export type MergePersonsInput = z.infer<typeof MergePersonsSchema>;

/**
 * Schema for getting person deals
 */
export const GetPersonDealsSchema = z.object({
  id: IdSchema
    .describe('ID of the person'),
  start: z.number()
    .int('Start must be an integer')
    .nonnegative('Start must be non-negative')
    .default(0)
    .optional()
    .describe('Pagination start'),
  limit: z.number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(500, 'Limit cannot exceed 500')
    .optional()
    .describe('Number of items to return'),
  status: z.enum(['open', 'won', 'lost', 'deleted', 'all_not_deleted'], {
    errorMap: () => ({ message: 'Status must be one of: open, won, lost, deleted, all_not_deleted' }),
  })
    .optional()
    .default('all_not_deleted')
    .describe('Filter by deal status'),
  sort: z.string()
    .optional()
    .describe('Field to sort by'),
}).strict();

export type GetPersonDealsInput = z.infer<typeof GetPersonDealsSchema>;

/**
 * Schema for getting person followers
 */
export const GetPersonFollowersSchema = z.object({
  id: IdSchema
    .describe('ID of the person'),
}).strict();

export type GetPersonFollowersInput = z.infer<typeof GetPersonFollowersSchema>;

/**
 * Schema for adding a follower to a person
 */
export const AddPersonFollowerSchema = z.object({
  id: IdSchema
    .describe('ID of the person'),
  user_id: IdSchema
    .describe('ID of the user to add as a follower'),
}).strict();

export type AddPersonFollowerInput = z.infer<typeof AddPersonFollowerSchema>;

/**
 * Schema for removing a follower from a person
 */
export const RemovePersonFollowerSchema = z.object({
  id: IdSchema
    .describe('ID of the person'),
  follower_id: IdSchema
    .describe('ID of the follower to remove'),
}).strict();

export type RemovePersonFollowerInput = z.infer<typeof RemovePersonFollowerSchema>;

/**
 * Schema for listing person activities
 */
export const GetPersonActivitiesSchema = z.object({
  id: IdSchema
    .describe('ID of the person'),
  start: z.number()
    .int('Start must be an integer')
    .nonnegative('Start must be non-negative')
    .default(0)
    .optional()
    .describe('Pagination start'),
  limit: z.number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(500, 'Limit cannot exceed 500')
    .optional()
    .describe('Number of items to return'),
  done: BooleanLikeSchema
    .optional()
    .describe('Filter by completion status'),
}).strict();

export type GetPersonActivitiesInput = z.infer<typeof GetPersonActivitiesSchema>;

/**
 * Schema for listing person files
 */
export const GetPersonFilesSchema = z.object({
  id: IdSchema
    .describe('ID of the person'),
  start: z.number()
    .int('Start must be an integer')
    .nonnegative('Start must be non-negative')
    .default(0)
    .optional()
    .describe('Pagination start'),
  limit: z.number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(500, 'Limit cannot exceed 500')
    .optional()
    .describe('Number of items to return'),
  sort: z.string()
    .optional()
    .describe('Field to sort by'),
}).strict();

export type GetPersonFilesInput = z.infer<typeof GetPersonFilesSchema>;

/**
 * Schema for listing person mail messages
 */
export const GetPersonMailMessagesSchema = z.object({
  id: IdSchema
    .describe('ID of the person'),
  start: z.number()
    .int('Start must be an integer')
    .nonnegative('Start must be non-negative')
    .default(0)
    .optional()
    .describe('Pagination start'),
  limit: z.number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(500, 'Limit cannot exceed 500')
    .optional()
    .describe('Number of items to return'),
}).strict();

export type GetPersonMailMessagesInput = z.infer<typeof GetPersonMailMessagesSchema>;

/**
 * Schema for listing person products
 */
export const GetPersonProductsSchema = z.object({
  id: IdSchema
    .describe('ID of the person'),
  start: z.number()
    .int('Start must be an integer')
    .nonnegative('Start must be non-negative')
    .default(0)
    .optional()
    .describe('Pagination start'),
  limit: z.number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(500, 'Limit cannot exceed 500')
    .optional()
    .describe('Number of items to return'),
}).strict();

export type GetPersonProductsInput = z.infer<typeof GetPersonProductsSchema>;

/**
 * Schema for listing person changelog (field value updates)
 */
export const GetPersonChangelogSchema = z.object({
  id: IdSchema
    .describe('ID of the person'),
  cursor: z.string()
    .optional()
    .describe('Cursor for pagination'),
  limit: z.number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(500, 'Limit cannot exceed 500')
    .optional()
    .describe('Number of items to return'),
}).strict();

export type GetPersonChangelogInput = z.infer<typeof GetPersonChangelogSchema>;

/**
 * Schema for listing person flow (updates about a person)
 */
export const GetPersonFlowSchema = z.object({
  id: IdSchema
    .describe('ID of the person'),
  start: z.number()
    .int('Start must be an integer')
    .nonnegative('Start must be non-negative')
    .default(0)
    .optional()
    .describe('Pagination start'),
  limit: z.number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(500, 'Limit cannot exceed 500')
    .optional()
    .describe('Number of items to return'),
  all_changes: z.string()
    .optional()
    .describe('Whether to show all field changes'),
  items: z.string()
    .optional()
    .describe('Types of items to include'),
}).strict();

export type GetPersonFlowInput = z.infer<typeof GetPersonFlowSchema>;

/**
 * Schema for listing permitted users
 */
export const GetPersonPermittedUsersSchema = z.object({
  id: IdSchema
    .describe('ID of the person'),
}).strict();

export type GetPersonPermittedUsersInput = z.infer<typeof GetPersonPermittedUsersSchema>;

/**
 * Schema for deleting person picture
 */
export const DeletePersonPictureSchema = z.object({
  id: IdSchema
    .describe('ID of the person'),
}).strict();

export type DeletePersonPictureInput = z.infer<typeof DeletePersonPictureSchema>;

/**
 * Schema for adding person picture
 */
export const AddPersonPictureSchema = z.object({
  id: IdSchema
    .describe('ID of the person'),
  file: z.instanceof(Buffer)
    .describe('Image file buffer'),
  filename: z.string()
    .min(1, 'Filename is required')
    .describe('Name of the file'),
  crop_x: z.number()
    .int('Crop X must be an integer')
    .nonnegative('Crop X must be non-negative')
    .optional()
    .describe('X coordinate of the crop area'),
  crop_y: z.number()
    .int('Crop Y must be an integer')
    .nonnegative('Crop Y must be non-negative')
    .optional()
    .describe('Y coordinate of the crop area'),
  crop_width: z.number()
    .int('Crop width must be an integer')
    .positive('Crop width must be positive')
    .optional()
    .describe('Width of the crop area'),
  crop_height: z.number()
    .int('Crop height must be an integer')
    .positive('Crop height must be positive')
    .optional()
    .describe('Height of the crop area'),
}).strict();

export type AddPersonPictureInput = z.infer<typeof AddPersonPictureSchema>;

/**
 * Schema for bulk deleting persons
 */
export const BulkDeletePersonsSchema = z.object({
  ids: z.string()
    .min(1, 'IDs string is required')
    .describe('Comma-separated list of person IDs to delete'),
}).strict();

export type BulkDeletePersonsInput = z.infer<typeof BulkDeletePersonsSchema>;

/**
 * Schema for getting persons collection
 */
export const GetPersonsCollectionSchema = z.object({
  cursor: z.string()
    .optional()
    .describe('Cursor for pagination'),
  limit: z.number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(500, 'Limit cannot exceed 500')
    .default(100)
    .optional()
    .describe('Number of items to return'),
  since: z.string()
    .optional()
    .describe('Start date in YYYY-MM-DD format'),
  until: z.string()
    .optional()
    .describe('End date in YYYY-MM-DD format'),
  owner_id: OptionalIdSchema
    .describe('Filter by owner user ID'),
  first_char: z.string()
    .length(1, 'First char must be a single character')
    .regex(/^[a-zA-Z]$/, 'First char must be a letter')
    .optional()
    .describe('Filter by first character of name'),
}).strict();

export type GetPersonsCollectionInput = z.infer<typeof GetPersonsCollectionSchema>;
