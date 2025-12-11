import { z } from 'zod';

/**
 * Pagination schema for list operations
 */
export const PaginationSchema = z.object({
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
    .describe('Number of items to return per page'),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

/**
 * Visibility level schema
 * 1 = Owner & followers (private)
 * 3 = Entire company (shared)
 * 5 = Entire company (private)
 * 7 = Entire company (public)
 */
export const VisibilitySchema = z.enum(['1', '3', '5', '7'], {
  errorMap: () => ({ message: 'Visibility must be one of: 1 (private), 3 (shared), 5 (private), 7 (public)' }),
}).describe('Visibility level for the item');

export type VisibilityLevel = z.infer<typeof VisibilitySchema>;

/**
 * Email contact schema
 */
export const EmailItemSchema = z.object({
  value: z.string()
    .email('Invalid email format')
    .describe('Email address'),
  primary: z.boolean()
    .optional()
    .default(false)
    .describe('Whether this is the primary email'),
  label: z.string()
    .optional()
    .describe('Label for this email (e.g., work, home)'),
});

export const EmailSchema = z.array(EmailItemSchema)
  .min(1, 'At least one email is required')
  .describe('Array of email addresses');

export type EmailItem = z.infer<typeof EmailItemSchema>;
export type EmailArray = z.infer<typeof EmailSchema>;

/**
 * Phone contact schema
 */
export const PhoneItemSchema = z.object({
  value: z.string()
    .min(1, 'Phone number cannot be empty')
    .describe('Phone number'),
  primary: z.boolean()
    .optional()
    .default(false)
    .describe('Whether this is the primary phone'),
  label: z.string()
    .optional()
    .describe('Label for this phone (e.g., work, mobile, home)'),
});

export const PhoneSchema = z.array(PhoneItemSchema)
  .min(1, 'At least one phone number is required')
  .describe('Array of phone numbers');

export type PhoneItem = z.infer<typeof PhoneItemSchema>;
export type PhoneArray = z.infer<typeof PhoneSchema>;

/**
 * Deal status schema for filtering
 */
export const DealStatusSchema = z.enum(['open', 'won', 'lost', 'deleted', 'all_not_deleted'], {
  errorMap: () => ({ message: 'Status must be one of: open, won, lost, deleted, all_not_deleted' }),
}).describe('Deal status filter');

export type DealStatus = z.infer<typeof DealStatusSchema>;

/**
 * Sort direction schema
 */
export const SortDirectionSchema = z.enum(['asc', 'desc'], {
  errorMap: () => ({ message: 'Sort direction must be either asc or desc' }),
}).default('asc').describe('Sort direction');

export type SortDirection = z.infer<typeof SortDirectionSchema>;

/**
 * Marketing status schema for persons
 */
export const MarketingStatusSchema = z.enum(['no_consent', 'unsubscribed', 'subscribed', 'archived'], {
  errorMap: () => ({ message: 'Marketing status must be one of: no_consent, unsubscribed, subscribed, archived' }),
}).describe('Marketing consent status');

export type MarketingStatus = z.infer<typeof MarketingStatusSchema>;

/**
 * Currency code schema (ISO 4217)
 */
export const CurrencySchema = z.string()
  .length(3, 'Currency must be a 3-letter ISO code (e.g., USD, EUR)')
  .toUpperCase()
  .describe('Currency code in ISO 4217 format');

export type Currency = z.infer<typeof CurrencySchema>;

/**
 * ID schema for various entity IDs
 */
export const IdSchema = z.number()
  .int('ID must be an integer')
  .positive('ID must be positive')
  .describe('Entity ID');

export type EntityId = z.infer<typeof IdSchema>;

/**
 * Optional ID schema
 */
export const OptionalIdSchema = IdSchema.optional();

/**
 * Date string schema (ISO 8601 or YYYY-MM-DD)
 */
export const DateStringSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .describe('Date in YYYY-MM-DD format');

export type DateString = z.infer<typeof DateStringSchema>;

/**
 * DateTime string schema (ISO 8601)
 */
export const DateTimeStringSchema = z.string()
  .datetime({ message: 'DateTime must be in ISO 8601 format' })
  .describe('DateTime in ISO 8601 format');

export type DateTimeString = z.infer<typeof DateTimeStringSchema>;

/**
 * Boolean-like schema that accepts multiple formats
 */
export const BooleanLikeSchema = z.union([
  z.boolean(),
  z.enum(['0', '1']),
  z.number().int().min(0).max(1),
]).transform(val => {
  if (typeof val === 'boolean') return val;
  if (val === '1' || val === 1) return true;
  if (val === '0' || val === 0) return false;
  return false;
}).describe('Boolean value (accepts true/false, 0/1, "0"/"1")');

export type BooleanLike = z.infer<typeof BooleanLikeSchema>;
