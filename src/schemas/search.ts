import { z } from 'zod';
import { PaginationSchema, OptionalIdSchema } from './common.js';

/**
 * Search item types for universal search
 */
export const SearchItemTypeSchema = z.enum([
  'deal',
  'person',
  'organization',
  'product',
  'lead',
  'file',
], {
  errorMap: () => ({
    message: 'Item type must be one of: deal, person, organization, product, lead, file',
  }),
});

export type SearchItemType = z.infer<typeof SearchItemTypeSchema>;

/**
 * Schema for universal search across all types
 */
export const UniversalSearchSchema = z.object({
  term: z.string()
    .min(1, 'Search term must be at least 1 character when exact_match is true, 2 characters otherwise')
    .max(255, 'Search term cannot exceed 255 characters')
    .describe('Search term'),
  item_types: z.array(SearchItemTypeSchema)
    .optional()
    .describe('Array of item types to search (deal, person, organization, product, lead, file)'),
  fields: z.string()
    .optional()
    .describe('Comma-separated list of field names to search'),
  exact_match: z.boolean()
    .optional()
    .default(false)
    .describe('Whether to perform an exact match search'),
  search_for_related_items: z.boolean()
    .optional()
    .default(true)
    .describe('Whether to include up to 100 related items in the results'),
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
    .default(100)
    .describe('Number of items to return'),
}).strict();

export type UniversalSearchInput = z.infer<typeof UniversalSearchSchema>;

/**
 * Schema for searching by specific field
 */
export const SearchByFieldSchema = z.object({
  term: z.string()
    .min(1, 'Search term must be at least 1 character when exact_match is true, 2 characters otherwise')
    .max(255, 'Search term cannot exceed 255 characters')
    .describe('Search term'),
  field_type: z.enum([
    'dealField',
    'personField',
    'organizationField',
    'productField',
  ], {
    errorMap: () => ({
      message: 'Field type must be one of: dealField, personField, organizationField, productField',
    }),
  }).describe('Type of field to search'),
  field_key: z.string()
    .min(1, 'Field key is required')
    .max(100, 'Field key cannot exceed 100 characters')
    .describe('API key of the field to search'),
  exact_match: z.boolean()
    .optional()
    .default(false)
    .describe('Whether to perform an exact match search'),
  return_item_ids: z.boolean()
    .optional()
    .default(false)
    .describe('Whether to return item IDs instead of full objects'),
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
    .default(100)
    .describe('Number of items to return'),
}).strict();

export type SearchByFieldInput = z.infer<typeof SearchByFieldSchema>;

/**
 * Schema for deal-specific search
 */
export const SearchDealsSchema = z.object({
  term: z.string()
    .min(2, 'Search term must be at least 2 characters')
    .max(255, 'Search term cannot exceed 255 characters')
    .describe('Search term'),
  fields: z.string()
    .optional()
    .describe('Comma-separated list of field names to search (e.g., title, notes)'),
  exact_match: z.boolean()
    .optional()
    .default(false)
    .describe('Whether to perform an exact match search'),
  person_id: OptionalIdSchema
    .describe('Filter by associated person ID'),
  org_id: OptionalIdSchema
    .describe('Filter by associated organization ID'),
  status: z.enum(['open', 'won', 'lost', 'all_not_deleted'])
    .optional()
    .describe('Filter by deal status'),
  include_fields: z.string()
    .optional()
    .describe('Comma-separated list of fields to include in response'),
}).extend(PaginationSchema.shape).strict();

export type SearchDealsInput = z.infer<typeof SearchDealsSchema>;

/**
 * Schema for person-specific search
 */
export const SearchPersonsSchema = z.object({
  term: z.string()
    .min(2, 'Search term must be at least 2 characters')
    .max(255, 'Search term cannot exceed 255 characters')
    .describe('Search term'),
  fields: z.string()
    .optional()
    .describe('Comma-separated list of field names to search (e.g., name, email, phone)'),
  exact_match: z.boolean()
    .optional()
    .default(false)
    .describe('Whether to perform an exact match search'),
  org_id: OptionalIdSchema
    .describe('Filter by associated organization ID'),
  include_fields: z.string()
    .optional()
    .describe('Comma-separated list of fields to include in response'),
}).extend(PaginationSchema.shape).strict();

export type SearchPersonsInput = z.infer<typeof SearchPersonsSchema>;

/**
 * Schema for organization-specific search
 */
export const SearchOrganizationsSchema = z.object({
  term: z.string()
    .min(2, 'Search term must be at least 2 characters')
    .max(255, 'Search term cannot exceed 255 characters')
    .describe('Search term'),
  fields: z.string()
    .optional()
    .describe('Comma-separated list of field names to search (e.g., name, address)'),
  exact_match: z.boolean()
    .optional()
    .default(false)
    .describe('Whether to perform an exact match search'),
  include_fields: z.string()
    .optional()
    .describe('Comma-separated list of fields to include in response'),
}).extend(PaginationSchema.shape).strict();

export type SearchOrganizationsInput = z.infer<typeof SearchOrganizationsSchema>;

/**
 * Schema for product-specific search
 */
export const SearchProductsSchema = z.object({
  term: z.string()
    .min(2, 'Search term must be at least 2 characters')
    .max(255, 'Search term cannot exceed 255 characters')
    .describe('Search term'),
  fields: z.string()
    .optional()
    .describe('Comma-separated list of field names to search (e.g., name, code)'),
  exact_match: z.boolean()
    .optional()
    .default(false)
    .describe('Whether to perform an exact match search'),
  include_fields: z.string()
    .optional()
    .describe('Comma-separated list of fields to include in response'),
}).extend(PaginationSchema.shape).strict();

export type SearchProductsInput = z.infer<typeof SearchProductsSchema>;
