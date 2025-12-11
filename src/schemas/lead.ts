import { z } from 'zod';
import {
  OptionalIdSchema,
  PaginationSchema,
  VisibilitySchema,
  DateStringSchema,
  BooleanLikeSchema,
} from './common.js';

/**
 * Lead value schema - amount and currency
 */
export const LeadValueSchema = z.object({
  amount: z.number().nonnegative('Amount must be non-negative').describe('Lead value amount'),
  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter ISO code')
    .toUpperCase()
    .describe('Currency code (e.g., USD, EUR)'),
});

export type LeadValue = z.infer<typeof LeadValueSchema>;

/**
 * Lead ID schema - UUIDs for leads
 */
export const LeadIdSchema = z.string().uuid('Lead ID must be a valid UUID').describe('Lead UUID');

/**
 * Schema for creating a new lead
 */
export const CreateLeadSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required and cannot be empty')
      .max(255, 'Title cannot exceed 255 characters')
      .describe('Lead title'),
    owner_id: OptionalIdSchema.describe('ID of the user who will own this lead'),
    label_ids: z
      .array(z.string().uuid('Label ID must be a valid UUID'))
      .optional()
      .describe('Array of label UUIDs'),
    person_id: OptionalIdSchema.describe('ID of the person this lead is associated with'),
    organization_id: OptionalIdSchema.describe(
      'ID of the organization this lead is associated with'
    ),
    value: LeadValueSchema.optional().describe('Lead value with amount and currency'),
    expected_close_date: DateStringSchema.optional().describe(
      'Expected close date in YYYY-MM-DD format'
    ),
    visible_to: VisibilitySchema.optional().describe('Visibility of the lead'),
    was_seen: BooleanLikeSchema.optional().describe('Whether the lead was seen'),
    origin_id: z.string().optional().describe('Origin ID for tracking'),
    channel: z.number().int('Channel must be an integer').optional().describe('Channel ID'),
    channel_id: z.string().optional().describe('Channel identifier string'),
  })
  .strict();

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;

/**
 * Schema for updating an existing lead
 */
export const UpdateLeadSchema = z
  .object({
    id: LeadIdSchema.describe('UUID of the lead to update'),
    title: z
      .string()
      .min(1, 'Title cannot be empty')
      .max(255, 'Title cannot exceed 255 characters')
      .optional()
      .describe('Lead title'),
    owner_id: OptionalIdSchema.describe('ID of the user who will own this lead'),
    label_ids: z
      .array(z.string().uuid('Label ID must be a valid UUID'))
      .optional()
      .describe('Array of label UUIDs'),
    person_id: OptionalIdSchema.describe('ID of the person associated with this lead'),
    organization_id: OptionalIdSchema.describe('ID of the organization associated with this lead'),
    is_archived: BooleanLikeSchema.optional().describe('Whether the lead is archived'),
    value: LeadValueSchema.optional().describe('Lead value with amount and currency'),
    expected_close_date: DateStringSchema.optional().describe(
      'Expected close date in YYYY-MM-DD format'
    ),
    visible_to: VisibilitySchema.optional().describe('Visibility of the lead'),
    was_seen: BooleanLikeSchema.optional().describe('Whether the lead was seen'),
    channel: z.number().int('Channel must be an integer').optional().describe('Channel ID'),
    channel_id: z.string().optional().describe('Channel identifier string'),
  })
  .strict();

export type UpdateLeadInput = z.infer<typeof UpdateLeadSchema>;

/**
 * Schema for listing leads with filters
 */
export const ListLeadsSchema = PaginationSchema.extend({
  owner_id: OptionalIdSchema.describe('Filter by owner (user) ID'),
  person_id: OptionalIdSchema.describe('Filter by person ID'),
  organization_id: OptionalIdSchema.describe('Filter by organization ID'),
  filter_id: OptionalIdSchema.describe('ID of the filter to use'),
  sort: z
    .string()
    .optional()
    .describe('Field names and sorting mode (e.g., "title ASC, value DESC")'),
}).strict();

export type ListLeadsInput = z.infer<typeof ListLeadsSchema>;

/**
 * Schema for getting a single lead
 */
export const GetLeadSchema = z
  .object({
    id: LeadIdSchema.describe('UUID of the lead to retrieve'),
  })
  .strict();

export type GetLeadInput = z.infer<typeof GetLeadSchema>;

/**
 * Schema for deleting a lead
 */
export const DeleteLeadSchema = z
  .object({
    id: LeadIdSchema.describe('UUID of the lead to delete'),
  })
  .strict();

export type DeleteLeadInput = z.infer<typeof DeleteLeadSchema>;

/**
 * Schema for searching leads
 */
export const SearchLeadsSchema = z
  .object({
    term: z
      .string()
      .min(2, 'Search term must be at least 2 characters (or 1 with exact_match)')
      .max(255, 'Search term cannot exceed 255 characters')
      .describe('Search term'),
    fields: z.string().optional().describe('Comma-separated fields to search (defaults to all)'),
    exact_match: BooleanLikeSchema.optional()
      .default(false)
      .describe('Whether to perform exact match search (case insensitive)'),
    person_id: OptionalIdSchema.describe('Filter by person ID (max 2000 leads)'),
    organization_id: OptionalIdSchema.describe('Filter by organization ID (max 2000 leads)'),
    include_fields: z.string().optional().describe('Comma-separated optional fields to include'),
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

export type SearchLeadsInput = z.infer<typeof SearchLeadsSchema>;

/**
 * Schema for listing archived leads with filters
 */
export const ListArchivedLeadsSchema = PaginationSchema.extend({
  owner_id: OptionalIdSchema.describe('Filter by owner (user) ID'),
  person_id: OptionalIdSchema.describe('Filter by person ID'),
  organization_id: OptionalIdSchema.describe('Filter by organization ID'),
  filter_id: OptionalIdSchema.describe('ID of the filter to use'),
  sort: z
    .string()
    .optional()
    .describe('Field names and sorting mode (e.g., "title ASC, value DESC")'),
}).strict();

export type ListArchivedLeadsInput = z.infer<typeof ListArchivedLeadsSchema>;
