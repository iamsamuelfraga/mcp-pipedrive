import { z } from 'zod';

const LabelColorSchema = z.enum([
  'blue',
  'brown',
  'dark-gray',
  'gray',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'yellow',
]);

export type LeadLabelColor = z.infer<typeof LabelColorSchema>;

// Lead labels in Pipedrive use UUID string IDs.
const LeadLabelIdSchema = z.string().min(1, 'Lead label ID is required');

export const CreateLeadLabelSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255, 'Name max 255 chars'),
    color: LabelColorSchema,
  })
  .strict();

export type CreateLeadLabelInput = z.infer<typeof CreateLeadLabelSchema>;

export const UpdateLeadLabelSchema = z
  .object({
    id: LeadLabelIdSchema,
    name: z.string().min(1).max(255).optional(),
    color: LabelColorSchema.optional(),
  })
  .strict();

export type UpdateLeadLabelInput = z.infer<typeof UpdateLeadLabelSchema>;

export const DeleteLeadLabelSchema = z
  .object({
    id: LeadLabelIdSchema,
  })
  .strict();

export type DeleteLeadLabelInput = z.infer<typeof DeleteLeadLabelSchema>;
