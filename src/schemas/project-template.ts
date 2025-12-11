import { z } from 'zod';
import { IdSchema } from './common.js';

/**
 * Schema for getting all project templates
 */
export const GetProjectTemplatesSchema = z.object({
  cursor: z.string()
    .optional()
    .describe('For pagination, the marker representing the first item on the next page'),
  limit: z.number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(500, 'Limit cannot exceed 500')
    .optional()
    .default(100)
    .describe('Number of items to return per page (default: 100)'),
}).strict();

export type GetProjectTemplatesInput = z.infer<typeof GetProjectTemplatesSchema>;

/**
 * Schema for getting a single project template
 */
export const GetProjectTemplateSchema = z.object({
  id: IdSchema
    .describe('ID of the project template to retrieve'),
}).strict();

export type GetProjectTemplateInput = z.infer<typeof GetProjectTemplateSchema>;
