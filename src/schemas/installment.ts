import { z } from 'zod';
import { IdSchema, DateStringSchema } from './common.js';

/**
 * Schemas for deal installments (API v2: `/api/v2/deals/{id}/installments`).
 *
 * Installments model fixed, scheduled payments attached to a deal — the modern
 * replacement for the legacy Subscriptions API.
 */

const InstallmentAmountSchema = z
  .number()
  .positive('amount must be a positive number (0 is not allowed)');

export const ListInstallmentsSchema = z
  .object({
    deal_ids: z
      .array(IdSchema)
      .min(1, 'At least one deal_id is required')
      .max(100, 'A maximum of 100 deal_ids is allowed')
      .describe('Deal IDs to fetch installments for (1-100)'),
    cursor: z.string().optional().describe('Pagination cursor returned by a previous call'),
    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(500)
      .optional()
      .describe('Items per page (max 500)'),
  })
  .strict();

export type ListInstallmentsInput = z.infer<typeof ListInstallmentsSchema>;

export const AddInstallmentSchema = z
  .object({
    id: IdSchema.describe('Deal ID to attach the installment to'),
    description: z.string().min(1, 'description is required').describe('Installment name'),
    amount: InstallmentAmountSchema.describe('Installment amount (positive, non-zero)'),
    billing_date: DateStringSchema.describe('Billing date (YYYY-MM-DD)'),
  })
  .strict();

export type AddInstallmentInput = z.infer<typeof AddInstallmentSchema>;

export const UpdateInstallmentSchema = z
  .object({
    id: IdSchema.describe('Deal ID the installment belongs to'),
    installment_id: IdSchema.describe('Installment ID to update'),
    description: z.string().min(1).optional().describe('New installment name'),
    amount: InstallmentAmountSchema.optional().describe('New amount (positive, non-zero)'),
    billing_date: DateStringSchema.optional().describe('New billing date (YYYY-MM-DD)'),
  })
  .strict();

export type UpdateInstallmentInput = z.infer<typeof UpdateInstallmentSchema>;

export const DeleteInstallmentSchema = z
  .object({
    id: IdSchema.describe('Deal ID the installment belongs to'),
    installment_id: IdSchema.describe('Installment ID to delete'),
  })
  .strict();

export type DeleteInstallmentInput = z.infer<typeof DeleteInstallmentSchema>;
