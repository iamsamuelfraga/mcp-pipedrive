import { z } from 'zod';
import {
  IdSchema,
  PaginationSchema,
  BooleanLikeSchema,
} from './common.js';

/**
 * Schema for getting mail threads
 */
export const GetMailThreadsSchema = PaginationSchema.extend({
  folder: z.enum(['inbox', 'drafts', 'sent', 'archive'], {
    errorMap: () => ({ message: 'Folder must be one of: inbox, drafts, sent, archive' }),
  })
    .describe('The type of folder to fetch'),
}).strict();

export type GetMailThreadsInput = z.infer<typeof GetMailThreadsSchema>;

/**
 * Schema for getting a single mail thread
 */
export const GetMailThreadSchema = z.object({
  id: IdSchema
    .describe('ID of the mail thread'),
}).strict();

export type GetMailThreadInput = z.infer<typeof GetMailThreadSchema>;

/**
 * Schema for getting mail messages in a thread
 */
export const GetMailThreadMessagesSchema = z.object({
  id: IdSchema
    .describe('ID of the mail thread'),
}).strict();

export type GetMailThreadMessagesInput = z.infer<typeof GetMailThreadMessagesSchema>;

/**
 * Schema for updating mail thread details
 */
export const UpdateMailThreadSchema = z.object({
  id: IdSchema
    .describe('ID of the mail thread'),
  deal_id: IdSchema
    .optional()
    .describe('ID of the deal this thread will be associated with'),
  lead_id: z.string()
    .optional()
    .describe('ID of the lead this thread will be associated with'),
  shared_flag: BooleanLikeSchema
    .optional()
    .describe('Whether the mail thread is shared with other users'),
  read_flag: BooleanLikeSchema
    .optional()
    .describe('Whether the mail thread is read'),
  archived_flag: BooleanLikeSchema
    .optional()
    .describe('Whether the mail thread is archived'),
}).strict();

export type UpdateMailThreadInput = z.infer<typeof UpdateMailThreadSchema>;

/**
 * Schema for deleting a mail thread
 */
export const DeleteMailThreadSchema = z.object({
  id: IdSchema
    .describe('ID of the mail thread to delete'),
}).strict();

export type DeleteMailThreadInput = z.infer<typeof DeleteMailThreadSchema>;

/**
 * Schema for getting a single mail message
 */
export const GetMailMessageSchema = z.object({
  id: IdSchema
    .describe('ID of the mail message'),
  include_body: BooleanLikeSchema
    .optional()
    .default(false)
    .describe('Whether to include the full message body or not'),
}).strict();

export type GetMailMessageInput = z.infer<typeof GetMailMessageSchema>;
