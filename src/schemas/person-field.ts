import { z } from 'zod';
import { IdSchema } from './common.js';
import { FieldTypeSchema, FieldOptionSchema } from './organization-field.js';

/**
 * Schema for creating a new person field (custom field).
 */
export const CreatePersonFieldSchema = z
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

export type CreatePersonFieldInput = z.infer<typeof CreatePersonFieldSchema>;

/**
 * Schema for updating an existing person field. Field type cannot be changed.
 */
export const UpdatePersonFieldSchema = z
  .object({
    id: IdSchema.describe('ID of the person field to update'),
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

export type UpdatePersonFieldInput = z.infer<typeof UpdatePersonFieldSchema>;

/**
 * Schema for deleting a single person field.
 */
export const DeletePersonFieldSchema = z
  .object({
    id: IdSchema.describe('ID of the person field to delete'),
  })
  .strict();

export type DeletePersonFieldInput = z.infer<typeof DeletePersonFieldSchema>;

/**
 * Schema for bulk-deleting person fields. Accepts a comma-separated list of IDs
 * as a string (matching Pipedrive's `?ids=` query parameter contract) or an array of
 * numeric IDs (which the handler will join).
 */
export const BulkDeletePersonFieldsSchema = z
  .object({
    ids: z
      .union([
        z.string().regex(/^\d+(,\d+)*$/, 'IDs must be a comma-separated list of numbers'),
        z.array(z.coerce.number().int().positive()).min(1, 'At least one ID is required'),
      ])
      .describe('Comma-separated string of IDs or array of numeric IDs'),
  })
  .strict();

export type BulkDeletePersonFieldsInput = z.infer<typeof BulkDeletePersonFieldsSchema>;
