import { z } from 'zod';
import { IdSchema } from './common.js';

/**
 * Pipedrive field types supported when creating/updating an organization field.
 * Source: https://developers.pipedrive.com/docs/api/v1/OrganizationFields
 */
export const FieldTypeSchema = z.enum([
  'varchar',
  'varchar_auto',
  'text',
  'double',
  'monetary',
  'date',
  'set',
  'enum',
  'user',
  'org',
  'people',
  'phone',
  'time',
  'timerange',
  'daterange',
  'address',
]);

export type FieldType = z.infer<typeof FieldTypeSchema>;

/**
 * Option entry used by `enum` and `set` field types.
 */
export const FieldOptionSchema = z
  .object({
    id: z.coerce.number().int().optional().describe('Existing option ID (when updating)'),
    label: z.string().min(1).describe('Visible label of the option'),
  })
  .strict();

export type FieldOption = z.infer<typeof FieldOptionSchema>;

/**
 * Schema for creating a new organization field (custom field).
 */
export const CreateOrganizationFieldSchema = z
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

export type CreateOrganizationFieldInput = z.infer<typeof CreateOrganizationFieldSchema>;

/**
 * Schema for updating an existing organization field. Field type cannot be changed.
 */
export const UpdateOrganizationFieldSchema = z
  .object({
    id: IdSchema.describe('ID of the organization field to update'),
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

export type UpdateOrganizationFieldInput = z.infer<typeof UpdateOrganizationFieldSchema>;

/**
 * Schema for deleting a single organization field.
 */
export const DeleteOrganizationFieldSchema = z
  .object({
    id: IdSchema.describe('ID of the organization field to delete'),
  })
  .strict();

export type DeleteOrganizationFieldInput = z.infer<typeof DeleteOrganizationFieldSchema>;

/**
 * Schema for bulk-deleting organization fields. Accepts a comma-separated list of IDs
 * as a string (matching Pipedrive's `?ids=` query parameter contract) or an array of
 * numeric IDs (which the handler will join).
 */
export const BulkDeleteOrganizationFieldsSchema = z
  .object({
    ids: z
      .union([
        z.string().regex(/^\d+(,\d+)*$/, 'IDs must be a comma-separated list of numbers'),
        z.array(z.coerce.number().int().positive()).min(1, 'At least one ID is required'),
      ])
      .describe('Comma-separated string of IDs or array of numeric IDs'),
  })
  .strict();

export type BulkDeleteOrganizationFieldsInput = z.infer<typeof BulkDeleteOrganizationFieldsSchema>;
