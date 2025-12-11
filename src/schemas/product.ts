import { z } from 'zod';
import {
  IdSchema,
  OptionalIdSchema,
  VisibilitySchema,
  PaginationSchema,
  BooleanLikeSchema,
} from './common.js';

/**
 * Price schema for product prices
 */
export const PriceSchema = z.object({
  price: z.number()
    .nonnegative('Price must be non-negative')
    .describe('Product price'),
  currency: z.string()
    .length(3, 'Currency must be a 3-letter code')
    .describe('Currency code (e.g., USD, EUR)'),
  cost: z.number()
    .nonnegative('Cost must be non-negative')
    .optional()
    .describe('Product cost'),
  overhead_cost: z.number()
    .nonnegative('Overhead cost must be non-negative')
    .optional()
    .describe('Overhead cost'),
  notes: z.string()
    .optional()
    .describe('Notes about the price'),
}).strict();

export type PriceInput = z.infer<typeof PriceSchema>;

/**
 * Billing frequency schema
 */
export const BillingFrequencySchema = z.enum([
  'one-time',
  'weekly',
  'monthly',
  'quarterly',
  'semi-annually',
  'annually',
], {
  errorMap: () => ({ message: 'Billing frequency must be one of: one-time, weekly, monthly, quarterly, semi-annually, annually' }),
}).describe('Billing frequency for the product');

export type BillingFrequency = z.infer<typeof BillingFrequencySchema>;

/**
 * Schema for creating a new product
 */
export const CreateProductSchema = z.object({
  name: z.string()
    .min(1, 'Name is required and cannot be empty')
    .max(255, 'Name cannot exceed 255 characters')
    .describe('Product name'),
  code: z.string()
    .max(255, 'Code cannot exceed 255 characters')
    .optional()
    .describe('Product code'),
  description: z.string()
    .optional()
    .describe('Product description'),
  unit: z.string()
    .optional()
    .describe('Unit type (e.g., pcs, kg, hours)'),
  tax: z.number()
    .nonnegative('Tax must be non-negative')
    .max(100, 'Tax cannot exceed 100%')
    .optional()
    .default(0)
    .describe('Tax percentage'),
  active_flag: BooleanLikeSchema
    .optional()
    .default(true)
    .describe('Whether the product is active'),
  selectable: BooleanLikeSchema
    .optional()
    .default(true)
    .describe('Whether the product is selectable in deals'),
  visible_to: VisibilitySchema
    .optional()
    .describe('Visibility of the product'),
  owner_id: OptionalIdSchema
    .describe('ID of the user who will be marked as the owner'),
  prices: z.array(PriceSchema)
    .optional()
    .describe('Array of product prices'),
  billing_frequency: BillingFrequencySchema
    .optional()
    .describe('Billing frequency'),
  billing_frequency_cycles: z.number()
    .int('Billing frequency cycles must be an integer')
    .positive('Billing frequency cycles must be positive')
    .optional()
    .nullable()
    .describe('Number of billing cycles'),
}).strict();

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

/**
 * Schema for updating an existing product
 */
export const UpdateProductSchema = z.object({
  id: IdSchema
    .describe('ID of the product to update'),
  name: z.string()
    .min(1, 'Name cannot be empty')
    .max(255, 'Name cannot exceed 255 characters')
    .optional()
    .describe('Product name'),
  code: z.string()
    .max(255, 'Code cannot exceed 255 characters')
    .optional()
    .describe('Product code'),
  description: z.string()
    .optional()
    .describe('Product description'),
  unit: z.string()
    .optional()
    .describe('Unit type (e.g., pcs, kg, hours)'),
  tax: z.number()
    .nonnegative('Tax must be non-negative')
    .max(100, 'Tax cannot exceed 100%')
    .optional()
    .describe('Tax percentage'),
  active_flag: BooleanLikeSchema
    .optional()
    .describe('Whether the product is active'),
  selectable: BooleanLikeSchema
    .optional()
    .describe('Whether the product is selectable in deals'),
  visible_to: VisibilitySchema
    .optional()
    .describe('Visibility of the product'),
  owner_id: OptionalIdSchema
    .describe('ID of the user who will be marked as the owner'),
  prices: z.array(PriceSchema)
    .optional()
    .describe('Array of product prices'),
  billing_frequency: BillingFrequencySchema
    .optional()
    .describe('Billing frequency'),
  billing_frequency_cycles: z.number()
    .int('Billing frequency cycles must be an integer')
    .positive('Billing frequency cycles must be positive')
    .optional()
    .nullable()
    .describe('Number of billing cycles'),
}).strict();

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

/**
 * Schema for listing products with filters
 */
export const ListProductsSchema = PaginationSchema.extend({
  user_id: OptionalIdSchema
    .describe('Filter by user (owner) ID'),
  filter_id: OptionalIdSchema
    .describe('ID of the filter to use'),
  ids: z.array(IdSchema)
    .optional()
    .describe('Array of product IDs to return'),
  first_char: z.string()
    .length(1, 'First char must be a single character')
    .regex(/^[a-zA-Z]$/, 'First char must be a letter')
    .optional()
    .describe('Filter by first character of name'),
  get_summary: BooleanLikeSchema
    .optional()
    .describe('Include summary count in response'),
}).strict();

export type ListProductsInput = z.infer<typeof ListProductsSchema>;

/**
 * Schema for searching products
 */
export const SearchProductsSchema = z.object({
  term: z.string()
    .min(1, 'Search term must be at least 1 character')
    .max(255, 'Search term cannot exceed 255 characters')
    .describe('Search term'),
  fields: z.string()
    .optional()
    .describe('Comma-separated list of fields to search in'),
  exact_match: BooleanLikeSchema
    .optional()
    .default(false)
    .describe('Whether to perform exact match search'),
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

export type SearchProductsInput = z.infer<typeof SearchProductsSchema>;

/**
 * Schema for getting a single product
 */
export const GetProductSchema = z.object({
  id: IdSchema
    .describe('ID of the product to retrieve'),
}).strict();

export type GetProductInput = z.infer<typeof GetProductSchema>;

/**
 * Schema for deleting a product
 */
export const DeleteProductSchema = z.object({
  id: IdSchema
    .describe('ID of the product to delete'),
}).strict();

export type DeleteProductInput = z.infer<typeof DeleteProductSchema>;

/**
 * Schema for deleting multiple products in bulk
 */
export const BulkDeleteProductsSchema = z.object({
  ids: z.string()
    .min(1, 'IDs string cannot be empty')
    .describe('Comma-separated product IDs to delete'),
}).strict();

export type BulkDeleteProductsInput = z.infer<typeof BulkDeleteProductsSchema>;

/**
 * Schema for getting product deals
 */
export const GetProductDealsSchema = z.object({
  id: IdSchema
    .describe('ID of the product'),
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
}).strict();

export type GetProductDealsInput = z.infer<typeof GetProductDealsSchema>;

/**
 * Schema for getting product followers
 */
export const GetProductFollowersSchema = z.object({
  id: IdSchema
    .describe('ID of the product'),
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

export type GetProductFollowersInput = z.infer<typeof GetProductFollowersSchema>;

/**
 * Schema for adding a follower to a product
 */
export const AddProductFollowerSchema = z.object({
  id: IdSchema
    .describe('ID of the product'),
  user_id: IdSchema
    .describe('ID of the user to add as a follower'),
}).strict();

export type AddProductFollowerInput = z.infer<typeof AddProductFollowerSchema>;

/**
 * Schema for removing a follower from a product
 */
export const RemoveProductFollowerSchema = z.object({
  id: IdSchema
    .describe('ID of the product'),
  follower_id: IdSchema
    .describe('ID of the follower relationship to remove'),
}).strict();

export type RemoveProductFollowerInput = z.infer<typeof RemoveProductFollowerSchema>;

/**
 * Schema for listing product files
 */
export const GetProductFilesSchema = z.object({
  id: IdSchema
    .describe('ID of the product'),
  start: z.number()
    .int('Start must be an integer')
    .nonnegative('Start must be non-negative')
    .default(0)
    .optional()
    .describe('Pagination start'),
  limit: z.number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(100, 'Limit cannot exceed 100')
    .optional()
    .describe('Number of items to return'),
  sort: z.string()
    .optional()
    .describe('Field to sort by (id, update_time)'),
}).strict();

export type GetProductFilesInput = z.infer<typeof GetProductFilesSchema>;

/**
 * Schema for listing users permitted to access a product
 */
export const GetProductPermittedUsersSchema = z.object({
  id: IdSchema
    .describe('ID of the product'),
}).strict();

export type GetProductPermittedUsersInput = z.infer<typeof GetProductPermittedUsersSchema>;
