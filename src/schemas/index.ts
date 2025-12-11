/**
 * Central export file for all Zod validation schemas
 */

// Common schemas
export * from './common.js';

// Entity-specific schemas
export * from './deal.js';
export * from './person.js';
export * from './organization.js';
export * from './activity.js';
export * from './file.js';
export * from './pipeline.js';
export * from './note.js';
export * from './lead.js';
export * from './goal.js';
export * from './task.js';
export * from './activity-type.js';
export * from './call-log.js';
export * from './project-template.js';
export * from './permission-set.js';

// Search schemas (export separately to avoid conflicts)
export type { UniversalSearchInput, SearchByFieldInput, SearchItemType } from './search.js';
export { UniversalSearchSchema, SearchByFieldSchema, SearchItemTypeSchema } from './search.js';
