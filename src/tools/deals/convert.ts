import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import { IdSchema } from '../../schemas/common.js';

const ConvertDealSchema = z
  .object({
    id: IdSchema,
  })
  .strict();

const ConvertStatusSchema = z
  .object({
    id: IdSchema,
    conversion_id: z.string().min(1, 'conversion_id required'),
  })
  .strict();

export function getDealConvertTools(client: PipedriveClient) {
  return {
    deals_convert_to_lead: {
      description: `Convert a deal into a lead (asynchronous, two-step flow).

Step 1 (this tool): POST starts the conversion. Returns { id: conversion_id, status: 'queued' | 'running' }.
Step 2 (separate tool): poll deals_convert_status with the deal id AND the conversion_id
returned here, every few seconds, until status === 'completed'. The completed response
includes the resulting lead_id.

Related entities (notes, files, emails, activities) are transferred to the new lead.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'Deal ID to convert' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = ConvertDealSchema.parse(args);
        return client.post(`/api/v2/deals/${id}/convert/lead`);
      },
    },

    deals_convert_status: {
      description: `Check the status of a deal-to-lead conversion job.

Use the conversion_id returned by deals_convert_to_lead. Possible statuses: queued,
running, completed, failed. When completed, the response includes the resulting lead_id.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'Deal ID that is being converted' },
          conversion_id: { type: 'string', description: 'ID returned by deals_convert_to_lead' },
        },
        required: ['id', 'conversion_id'],
      },
      handler: async (args: unknown) => {
        const { id, conversion_id } = ConvertStatusSchema.parse(args);
        return client.get(`/api/v2/deals/${id}/convert/status/${conversion_id}`);
      },
    },
  };
}
