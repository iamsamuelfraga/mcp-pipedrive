import { z } from 'zod';
import {
  IdSchema,
  OptionalIdSchema,
  PaginationSchema,
  SortDirectionSchema,
} from './common.js';

/**
 * Schema for uploading a file
 */
export const UploadFileSchema = z.object({
  file: z.instanceof(Buffer, {
    message: 'File must be a Buffer object',
  }).describe('File content as a Buffer'),
  file_name: z.string()
    .min(1, 'File name is required')
    .max(255, 'File name cannot exceed 255 characters')
    .describe('Name of the file including extension'),
  deal_id: OptionalIdSchema
    .describe('ID of the deal to attach the file to'),
  person_id: OptionalIdSchema
    .describe('ID of the person to attach the file to'),
  org_id: OptionalIdSchema
    .describe('ID of the organization to attach the file to'),
  activity_id: OptionalIdSchema
    .describe('ID of the activity to attach the file to'),
  product_id: OptionalIdSchema
    .describe('ID of the product to attach the file to'),
}).strict().refine(
  (data) => {
    // At least one association should be provided
    return (
      data.deal_id !== undefined ||
      data.person_id !== undefined ||
      data.org_id !== undefined ||
      data.activity_id !== undefined ||
      data.product_id !== undefined
    );
  },
  {
    message: 'At least one of deal_id, person_id, org_id, activity_id, or product_id must be provided',
    path: ['deal_id'],
  }
);

export type UploadFileInput = z.infer<typeof UploadFileSchema>;

/**
 * Schema for uploading a file from a path
 */
export const UploadFileFromPathSchema = z.object({
  file_path: z.string()
    .min(1, 'File path is required')
    .describe('Path to the file to upload'),
  deal_id: OptionalIdSchema
    .describe('ID of the deal to attach the file to'),
  person_id: OptionalIdSchema
    .describe('ID of the person to attach the file to'),
  org_id: OptionalIdSchema
    .describe('ID of the organization to attach the file to'),
  activity_id: OptionalIdSchema
    .describe('ID of the activity to attach the file to'),
  product_id: OptionalIdSchema
    .describe('ID of the product to attach the file to'),
}).strict().refine(
  (data) => {
    // At least one association should be provided
    return (
      data.deal_id !== undefined ||
      data.person_id !== undefined ||
      data.org_id !== undefined ||
      data.activity_id !== undefined ||
      data.product_id !== undefined
    );
  },
  {
    message: 'At least one of deal_id, person_id, org_id, activity_id, or product_id must be provided',
    path: ['deal_id'],
  }
);

export type UploadFileFromPathInput = z.infer<typeof UploadFileFromPathSchema>;

/**
 * Schema for getting a single file
 */
export const GetFileSchema = z.object({
  id: IdSchema
    .describe('ID of the file to retrieve'),
}).strict();

export type GetFileInput = z.infer<typeof GetFileSchema>;

/**
 * Schema for downloading a file
 */
export const DownloadFileSchema = z.object({
  id: IdSchema
    .describe('ID of the file to download'),
}).strict();

export type DownloadFileInput = z.infer<typeof DownloadFileSchema>;

/**
 * Schema for deleting a file
 */
export const DeleteFileSchema = z.object({
  id: IdSchema
    .describe('ID of the file to delete'),
}).strict();

export type DeleteFileInput = z.infer<typeof DeleteFileSchema>;

/**
 * Schema for updating a file
 */
export const UpdateFileSchema = z.object({
  id: IdSchema
    .describe('ID of the file to update'),
  name: z.string()
    .min(1, 'Name cannot be empty')
    .max(255, 'Name cannot exceed 255 characters')
    .optional()
    .describe('New name for the file'),
  description: z.string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
    .describe('Description of the file'),
}).strict();

export type UpdateFileInput = z.infer<typeof UpdateFileSchema>;

/**
 * Schema for listing files
 */
export const ListFilesSchema = PaginationSchema.extend({
  deal_id: OptionalIdSchema
    .describe('Filter by deal ID'),
  person_id: OptionalIdSchema
    .describe('Filter by person ID'),
  org_id: OptionalIdSchema
    .describe('Filter by organization ID'),
  activity_id: OptionalIdSchema
    .describe('Filter by activity ID'),
  product_id: OptionalIdSchema
    .describe('Filter by product ID'),
  include_deleted_files: z.boolean()
    .optional()
    .default(false)
    .describe('Whether to include deleted files'),
  sort: z.string()
    .optional()
    .describe('Field to sort by (e.g., add_time, update_time, file_name)'),
  sort_by: SortDirectionSchema
    .optional()
    .describe('Sort direction'),
}).strict();

export type ListFilesInput = z.infer<typeof ListFilesSchema>;

/**
 * Schema for linking a remote file
 */
export const LinkRemoteFileSchema = z.object({
  item_type: z.enum(['deal', 'person', 'organization', 'activity', 'product'], {
    errorMap: () => ({ message: 'Item type must be one of: deal, person, organization, activity, product' }),
  }).describe('Type of item to link the file to'),
  item_id: IdSchema
    .describe('ID of the item to link the file to'),
  remote_id: z.string()
    .min(1, 'Remote ID is required')
    .max(255, 'Remote ID cannot exceed 255 characters')
    .describe('ID of the file in the remote system'),
  remote_location: z.enum(['googledrive', 'dropbox', 'onedrive', 'box', 'sharepoint'], {
    errorMap: () => ({ message: 'Remote location must be one of: googledrive, dropbox, onedrive, box, sharepoint' }),
  }).describe('Remote file storage location'),
}).strict();

export type LinkRemoteFileInput = z.infer<typeof LinkRemoteFileSchema>;

/**
 * Schema for unlinking a remote file
 */
export const UnlinkRemoteFileSchema = z.object({
  id: IdSchema
    .describe('ID of the remote file link to remove'),
  item_type: z.enum(['deal', 'person', 'organization', 'activity', 'product'], {
    errorMap: () => ({ message: 'Item type must be one of: deal, person, organization, activity, product' }),
  }).describe('Type of item the file is linked to'),
  item_id: IdSchema
    .describe('ID of the item the file is linked to'),
}).strict();

export type UnlinkRemoteFileInput = z.infer<typeof UnlinkRemoteFileSchema>;

/**
 * Schema for searching files
 */
export const SearchFilesSchema = z.object({
  term: z.string()
    .min(2, 'Search term must be at least 2 characters')
    .max(255, 'Search term cannot exceed 255 characters')
    .describe('Search term'),
  deal_id: OptionalIdSchema
    .describe('Filter by deal ID'),
  person_id: OptionalIdSchema
    .describe('Filter by person ID'),
  org_id: OptionalIdSchema
    .describe('Filter by organization ID'),
  activity_id: OptionalIdSchema
    .describe('Filter by activity ID'),
  product_id: OptionalIdSchema
    .describe('Filter by product ID'),
  file_type: z.enum([
    'document',
    'image',
    'video',
    'audio',
    'spreadsheet',
    'presentation',
    'archive',
    'other',
  ], {
    errorMap: () => ({
      message: 'File type must be one of: document, image, video, audio, spreadsheet, presentation, archive, other',
    }),
  })
    .optional()
    .describe('Filter by file type'),
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

export type SearchFilesInput = z.infer<typeof SearchFilesSchema>;
