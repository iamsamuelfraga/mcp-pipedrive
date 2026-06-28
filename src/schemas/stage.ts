import { z } from 'zod';
import { IdSchema } from './common.js';

const ProbabilitySchema = z
  .number()
  .min(0, 'Probability must be 0-100')
  .max(100, 'Probability must be 0-100');

export const CreateStageSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255, 'Name max 255 chars'),
    pipeline_id: z.coerce.number().int().positive('pipeline_id must be a positive integer'),
    order_nr: z.coerce.number().int().nonnegative().optional(),
    deal_probability: ProbabilitySchema.optional(),
    is_deal_rot_enabled: z.boolean().optional(),
    days_to_rot: z.coerce.number().int().nonnegative().optional(),
  })
  .strict();

export type CreateStageInput = z.infer<typeof CreateStageSchema>;

export const UpdateStageSchema = z
  .object({
    id: IdSchema.describe('Stage ID to update'),
    name: z.string().min(1).max(255).optional(),
    pipeline_id: z.coerce.number().int().positive().optional(),
    order_nr: z.coerce.number().int().nonnegative().optional(),
    deal_probability: ProbabilitySchema.optional(),
    is_deal_rot_enabled: z.boolean().optional(),
    days_to_rot: z.coerce.number().int().nonnegative().optional(),
  })
  .strict();

export type UpdateStageInput = z.infer<typeof UpdateStageSchema>;

export const ListStagesSchema = z
  .object({
    pipeline_id: z.coerce.number().int().positive().optional(),
  })
  .strict();

export type ListStagesInput = z.infer<typeof ListStagesSchema>;

export const GetStageSchema = z
  .object({
    id: IdSchema.describe('Stage ID to fetch'),
  })
  .strict();

export type GetStageInput = z.infer<typeof GetStageSchema>;

export const DeleteStageSchema = z
  .object({
    id: IdSchema.describe('Stage ID to delete'),
  })
  .strict();

export type DeleteStageInput = z.infer<typeof DeleteStageSchema>;
