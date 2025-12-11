import { z } from 'zod';
import { OptionalIdSchema, DateTimeStringSchema, PaginationSchema } from './common.js';

/**
 * Schema for creating a new call log
 */
export const CreateCallLogSchema = z.object({
  to_phone_number: z.string()
    .min(1, 'To phone number is required')
    .describe('Phone number called'),
  outcome: z.string()
    .min(1, 'Outcome is required')
    .describe('Call outcome (e.g., connected, no_answer, busy, voicemail)'),
  start_time: DateTimeStringSchema
    .describe('Call start time in ISO 8601 format'),
  end_time: DateTimeStringSchema
    .describe('Call end time in ISO 8601 format'),
  user_id: OptionalIdSchema
    .describe('ID of the user who made the call'),
  activity_id: OptionalIdSchema
    .describe('ID of the associated activity'),
  subject: z.string()
    .max(255, 'Subject cannot exceed 255 characters')
    .optional()
    .describe('Call subject/title'),
  duration: z.string()
    .optional()
    .describe('Call duration (e.g., "120" for 120 seconds)'),
  from_phone_number: z.string()
    .optional()
    .describe('Phone number that made the call'),
  person_id: OptionalIdSchema
    .describe('ID of the person associated with the call'),
  org_id: OptionalIdSchema
    .describe('ID of the organization associated with the call'),
  deal_id: OptionalIdSchema
    .describe('ID of the deal associated with the call'),
  lead_id: z.string()
    .uuid('Lead ID must be a valid UUID')
    .optional()
    .describe('UUID of the lead associated with the call'),
  note: z.string()
    .max(2000, 'Note cannot exceed 2000 characters')
    .optional()
    .describe('Additional notes about the call'),
}).strict();

export type CreateCallLogInput = z.infer<typeof CreateCallLogSchema>;

/**
 * Schema for getting a specific call log
 */
export const GetCallLogSchema = z.object({
  id: z.string()
    .min(1, 'Call log ID is required')
    .describe('ID of the call log to retrieve'),
});

export type GetCallLogInput = z.infer<typeof GetCallLogSchema>;

/**
 * Schema for deleting a call log
 */
export const DeleteCallLogSchema = z.object({
  id: z.string()
    .min(1, 'Call log ID is required')
    .describe('ID of the call log to delete'),
});

export type DeleteCallLogInput = z.infer<typeof DeleteCallLogSchema>;

/**
 * Schema for listing call logs
 */
export const ListCallLogsSchema = PaginationSchema.extend({
  // Call logs use standard pagination with start/limit
}).strict();

export type ListCallLogsInput = z.infer<typeof ListCallLogsSchema>;

/**
 * Schema for attaching audio to a call log
 * Note: This is a multipart/form-data request, so we only validate the ID
 */
export const AttachAudioSchema = z.object({
  id: z.string()
    .min(1, 'Call log ID is required')
    .describe('ID of the call log to attach audio to'),
  file_path: z.string()
    .min(1, 'File path is required')
    .describe('Path to the audio file to attach'),
});

export type AttachAudioInput = z.infer<typeof AttachAudioSchema>;
