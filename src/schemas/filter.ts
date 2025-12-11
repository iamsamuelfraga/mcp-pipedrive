import { z } from 'zod';
import {
  IdSchema,
} from './common.js';

/**
 * Filter type schema - the type of entity the filter applies to
 */
export const FilterTypeSchema = z.enum(['deals', 'org', 'people', 'products', 'activities'], {
  errorMap: () => ({ message: 'Type must be one of: deals, org, people, products, activities' }),
}).describe('The type of filter');

export type FilterType = z.infer<typeof FilterTypeSchema>;

/**
 * Filter condition operator schema
 */
export const FilterOperatorSchema = z.enum([
  '=',
  '!=',
  '<',
  '>',
  '<=',
  '>=',
  'IS NULL',
  'IS NOT NULL',
  'LIKE',
  'NOT LIKE',
  'IN',
  'NOT IN',
], {
  errorMap: () => ({ message: 'Invalid operator' }),
}).describe('Condition operator');

export type FilterOperator = z.infer<typeof FilterOperatorSchema>;

/**
 * Single filter condition (leaf node)
 */
export const FilterConditionLeafSchema = z.object({
  object: z.string()
    .describe('Object type (e.g., deal, person, org)'),
  field_id: z.string()
    .describe('Field ID or field key'),
  operator: FilterOperatorSchema
    .describe('Comparison operator'),
  value: z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.union([z.string(), z.number()]))])
    .optional()
    .describe('Value to compare against'),
  extra_value: z.union([z.string(), z.number()])
    .optional()
    .describe('Extra value for range conditions'),
});

export type FilterConditionLeaf = z.infer<typeof FilterConditionLeafSchema>;

/**
 * Filter condition group (can contain nested conditions)
 */
export const FilterConditionGroupSchema: z.ZodType<{
  glue: 'and' | 'or';
  conditions: Array<FilterConditionLeaf | { glue: 'and' | 'or'; conditions: any[] } | null>;
}> = z.lazy(() =>
  z.object({
    glue: z.enum(['and', 'or'], {
      errorMap: () => ({ message: 'Glue must be "and" or "or"' }),
    }).describe('How to combine conditions (AND/OR)'),
    conditions: z.array(
      z.union([
        FilterConditionLeafSchema,
        FilterConditionGroupSchema,
        z.null(),
      ])
    ).describe('Array of conditions or condition groups'),
  })
);

export type FilterConditionGroup = z.infer<typeof FilterConditionGroupSchema>;

/**
 * Complete filter conditions structure
 * Note: Pipedrive API has limitations:
 * - Only one first-level condition group is supported (glued with 'AND')
 * - Only two second-level condition groups are supported
 * - First must be glued with 'AND', second with 'OR'
 */
export const FilterConditionsSchema = FilterConditionGroupSchema;

export type FilterConditions = z.infer<typeof FilterConditionsSchema>;

/**
 * Schema for creating a new filter
 */
export const CreateFilterSchema = z.object({
  name: z.string()
    .min(1, 'Name is required and cannot be empty')
    .max(255, 'Name cannot exceed 255 characters')
    .describe('Filter name'),
  conditions: FilterConditionsSchema
    .describe('Filter conditions structure'),
  type: FilterTypeSchema
    .describe('The type of filter (deals, org, people, products, activities)'),
}).strict();

export type CreateFilterInput = z.infer<typeof CreateFilterSchema>;

/**
 * Schema for updating an existing filter
 */
export const UpdateFilterSchema = z.object({
  id: IdSchema
    .describe('ID of the filter to update'),
  name: z.string()
    .min(1, 'Name cannot be empty')
    .max(255, 'Name cannot exceed 255 characters')
    .optional()
    .describe('Filter name'),
  conditions: FilterConditionsSchema
    .optional()
    .describe('Filter conditions structure'),
}).strict();

export type UpdateFilterInput = z.infer<typeof UpdateFilterSchema>;

/**
 * Schema for listing filters
 */
export const ListFiltersSchema = z.object({
  type: FilterTypeSchema
    .optional()
    .describe('Filter by type (deals, org, people, products, activities)'),
}).strict();

export type ListFiltersInput = z.infer<typeof ListFiltersSchema>;

/**
 * Schema for getting a single filter
 */
export const GetFilterSchema = z.object({
  id: IdSchema
    .describe('ID of the filter to retrieve'),
}).strict();

export type GetFilterInput = z.infer<typeof GetFilterSchema>;

/**
 * Schema for deleting a filter
 */
export const DeleteFilterSchema = z.object({
  id: IdSchema
    .describe('ID of the filter to delete'),
}).strict();

export type DeleteFilterInput = z.infer<typeof DeleteFilterSchema>;

/**
 * Schema for bulk deleting filters
 */
export const BulkDeleteFiltersSchema = z.object({
  ids: z.string()
    .min(1, 'At least one filter ID is required')
    .describe('Comma-separated filter IDs to delete'),
}).strict();

export type BulkDeleteFiltersInput = z.infer<typeof BulkDeleteFiltersSchema>;
