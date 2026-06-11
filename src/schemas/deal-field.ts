import { z } from 'zod';
import { IdSchema } from './common.js';
import { FieldTypeSchema, FieldOptionSchema } from './organization-field.js';

/**
 * Schema for creating a new deal field (custom field).
 */
export const CreateDealFieldSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required and cannot be empty')
      .max(255, 'Name cannot exceed 255 characters')
      .describe('Display name of the field'),
    field_type: FieldTypeSchema.describe(
      'Type of the field. `enum`/`set` require `options`. `varchar_auto` is read-only.'
    ),
    options: z
      .array(FieldOptionSchema)
      .min(1, 'At least one option is required for enum/set fields')
      .optional()
      .describe('Required for `enum` and `set` field types'),
    add_visible_flag: z
      .boolean()
      .optional()
      .describe('Whether the field is shown in the "add" form by default'),
  })
  .strict()
  .superRefine((data, ctx) => {
    if ((data.field_type === 'enum' || data.field_type === 'set') && !data.options?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: `field_type "${data.field_type}" requires at least one option`,
      });
    }
  });

export type CreateDealFieldInput = z.infer<typeof CreateDealFieldSchema>;

/**
 * Schema for updating an existing deal field. Field type cannot be changed.
 */
export const UpdateDealFieldSchema = z
  .object({
    id: IdSchema.describe('ID of the deal field to update'),
    name: z
      .string()
      .min(1, 'Name cannot be empty')
      .max(255, 'Name cannot exceed 255 characters')
      .optional()
      .describe('New display name of the field'),
    options: z
      .array(FieldOptionSchema)
      .optional()
      .describe(
        'New full set of options for `enum`/`set` fields. Include existing option `id` to preserve, omit it to add a new option.'
      ),
    add_visible_flag: z
      .boolean()
      .optional()
      .describe('Whether the field is shown in the "add" form by default'),
  })
  .strict();

export type UpdateDealFieldInput = z.infer<typeof UpdateDealFieldSchema>;

/**
 * Schema for deleting a single deal field.
 */
export const DeleteDealFieldSchema = z
  .object({
    id: IdSchema.describe('ID of the deal field to delete'),
  })
  .strict();

export type DeleteDealFieldInput = z.infer<typeof DeleteDealFieldSchema>;

/**
 * Schema for bulk-deleting deal fields. Accepts a comma-separated list of IDs
 * as a string (matching Pipedrive's `?ids=` query parameter contract) or an array of
 * numeric IDs (which the handler will join).
 */
export const BulkDeleteDealFieldsSchema = z
  .object({
    ids: z
      .union([
        z.string().regex(/^\d+(,\d+)*$/, 'IDs must be a comma-separated list of numbers'),
        z.array(z.coerce.number().int().positive()).min(1, 'At least one ID is required'),
      ])
      .describe('Comma-separated string of IDs or array of numeric IDs'),
  })
  .strict();

export type BulkDeleteDealFieldsInput = z.infer<typeof BulkDeleteDealFieldsSchema>;
