import { z } from 'zod';
import { FieldTypeSchema, FieldOptionSchema } from './organization-field.js';

/**
 * Schemas for project fields (API v2: `/api/v2/projectFields`).
 *
 * Project fields are identified by a string `field_code` (not a numeric id), in line
 * with the v2 API. They reuse the standard field type / option shapes.
 */

const FieldCodeSchema = z.string().min(1, 'field_code is required');

export const CreateProjectFieldSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required and cannot be empty')
      .max(255, 'Name cannot exceed 255 characters')
      .describe('Display name of the field'),
    field_type: FieldTypeSchema.describe('Type of the field. `enum`/`set` require `options`.'),
    options: z
      .array(FieldOptionSchema)
      .min(1, 'At least one option is required for enum/set fields')
      .optional()
      .describe('Required for `enum` and `set` field types'),
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

export type CreateProjectFieldInput = z.infer<typeof CreateProjectFieldSchema>;

export const UpdateProjectFieldSchema = z
  .object({
    field_code: FieldCodeSchema.describe('Field code of the project field to update'),
    name: z.string().min(1).max(255).optional().describe('New display name of the field'),
    options: z
      .array(FieldOptionSchema)
      .optional()
      .describe('New full set of options for `enum`/`set` fields'),
  })
  .strict();

export type UpdateProjectFieldInput = z.infer<typeof UpdateProjectFieldSchema>;

export const DeleteProjectFieldSchema = z
  .object({
    field_code: FieldCodeSchema.describe('Field code of the project field to delete'),
  })
  .strict();

export type DeleteProjectFieldInput = z.infer<typeof DeleteProjectFieldSchema>;
