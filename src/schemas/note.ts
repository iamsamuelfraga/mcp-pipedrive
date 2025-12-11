import { z } from 'zod';
import { IdSchema, OptionalIdSchema, PaginationSchema, SortDirectionSchema } from './common.js';

/**
 * Schema for creating a note
 */
export const CreateNoteSchema = z.object({
  content: z.string()
    .min(1, 'Note content is required')
    .max(65000, 'Note content cannot exceed 65000 characters')
    .describe('Content of the note (supports HTML)'),
  deal_id: OptionalIdSchema
    .describe('ID of the deal to attach the note to'),
  person_id: OptionalIdSchema
    .describe('ID of the person to attach the note to'),
  org_id: OptionalIdSchema
    .describe('ID of the organization to attach the note to'),
  lead_id: OptionalIdSchema
    .describe('ID of the lead to attach the note to'),
  user_id: OptionalIdSchema
    .describe('ID of the user who will be marked as the creator'),
  add_time: z.string()
    .optional()
    .describe('Creation time in YYYY-MM-DD HH:MM:SS format'),
  pinned_to_deal_flag: z.boolean()
    .optional()
    .describe('Whether to pin the note to the deal'),
  pinned_to_person_flag: z.boolean()
    .optional()
    .describe('Whether to pin the note to the person'),
  pinned_to_organization_flag: z.boolean()
    .optional()
    .describe('Whether to pin the note to the organization'),
  pinned_to_lead_flag: z.boolean()
    .optional()
    .describe('Whether to pin the note to the lead'),
}).strict();

export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;

/**
 * Schema for getting a single note
 */
export const GetNoteSchema = z.object({
  id: IdSchema
    .describe('ID of the note to retrieve'),
}).strict();

export type GetNoteInput = z.infer<typeof GetNoteSchema>;

/**
 * Schema for updating a note
 */
export const UpdateNoteSchema = z.object({
  id: IdSchema
    .describe('ID of the note to update'),
  content: z.string()
    .min(1, 'Note content cannot be empty')
    .max(65000, 'Note content cannot exceed 65000 characters')
    .optional()
    .describe('Content of the note (supports HTML)'),
  deal_id: OptionalIdSchema
    .describe('ID of the deal to attach the note to'),
  person_id: OptionalIdSchema
    .describe('ID of the person to attach the note to'),
  org_id: OptionalIdSchema
    .describe('ID of the organization to attach the note to'),
  lead_id: OptionalIdSchema
    .describe('ID of the lead to attach the note to'),
  pinned_to_deal_flag: z.boolean()
    .optional()
    .describe('Whether to pin the note to the deal'),
  pinned_to_person_flag: z.boolean()
    .optional()
    .describe('Whether to pin the note to the person'),
  pinned_to_organization_flag: z.boolean()
    .optional()
    .describe('Whether to pin the note to the organization'),
  pinned_to_lead_flag: z.boolean()
    .optional()
    .describe('Whether to pin the note to the lead'),
}).strict();

export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;

/**
 * Schema for deleting a note
 */
export const DeleteNoteSchema = z.object({
  id: IdSchema
    .describe('ID of the note to delete'),
}).strict();

export type DeleteNoteInput = z.infer<typeof DeleteNoteSchema>;

/**
 * Schema for listing notes
 */
export const ListNotesSchema = PaginationSchema.extend({
  deal_id: OptionalIdSchema
    .describe('Filter by deal ID'),
  person_id: OptionalIdSchema
    .describe('Filter by person ID'),
  org_id: OptionalIdSchema
    .describe('Filter by organization ID'),
  lead_id: OptionalIdSchema
    .describe('Filter by lead ID'),
  user_id: OptionalIdSchema
    .describe('Filter by user (creator) ID'),
  sort: z.string()
    .optional()
    .describe('Field to sort by (e.g., add_time, update_time, content)'),
  sort_by: SortDirectionSchema
    .optional()
    .describe('Sort direction'),
  pinned_to_deal_flag: z.boolean()
    .optional()
    .describe('Filter by notes pinned to deals'),
  pinned_to_person_flag: z.boolean()
    .optional()
    .describe('Filter by notes pinned to persons'),
  pinned_to_organization_flag: z.boolean()
    .optional()
    .describe('Filter by notes pinned to organizations'),
  pinned_to_lead_flag: z.boolean()
    .optional()
    .describe('Filter by notes pinned to leads'),
}).strict();

export type ListNotesInput = z.infer<typeof ListNotesSchema>;

/**
 * Schema for listing comments for a note
 */
export const ListNoteCommentsSchema = z.object({
  id: IdSchema
    .describe('ID of the note to get comments for'),
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
    .describe('Number of items to return per page'),
}).strict();

export type ListNoteCommentsInput = z.infer<typeof ListNoteCommentsSchema>;

/**
 * Schema for adding a comment to a note
 */
export const AddNoteCommentSchema = z.object({
  id: IdSchema
    .describe('ID of the note to add a comment to'),
  content: z.string()
    .min(1, 'Comment content is required')
    .describe('Content of the comment'),
}).strict();

export type AddNoteCommentInput = z.infer<typeof AddNoteCommentSchema>;

/**
 * Schema for updating a comment on a note
 */
export const UpdateNoteCommentSchema = z.object({
  id: IdSchema
    .describe('ID of the note'),
  comment_id: z.string()
    .uuid('Comment ID must be a valid UUID')
    .describe('ID of the comment to update'),
  content: z.string()
    .min(1, 'Comment content is required')
    .describe('New content of the comment'),
}).strict();

export type UpdateNoteCommentInput = z.infer<typeof UpdateNoteCommentSchema>;

/**
 * Schema for deleting a comment from a note
 */
export const DeleteNoteCommentSchema = z.object({
  id: IdSchema
    .describe('ID of the note'),
  comment_id: z.string()
    .uuid('Comment ID must be a valid UUID')
    .describe('ID of the comment to delete'),
}).strict();

export type DeleteNoteCommentInput = z.infer<typeof DeleteNoteCommentSchema>;
