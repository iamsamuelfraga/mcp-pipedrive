import { z } from 'zod';
import { PaginationSchema, DateTimeStringSchema } from './common.js';

/**
 * Schema for getting recents with pagination
 */
export const GetRecentsSchema = PaginationSchema.extend({
  since_timestamp: DateTimeStringSchema
    .describe('The timestamp in UTC. Format: YYYY-MM-DD HH:MM:SS'),
  items: z.string()
    .optional()
    .describe('Multiple selection of item types to include in the query (comma-separated)'),
}).strict();

export type GetRecentsInput = z.infer<typeof GetRecentsSchema>;
