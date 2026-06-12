import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';

const ConvertLeadSchema = z
  .object({
    id: z.string().min(1, 'Lead UUID required'),
  })
  .strict();

const ConvertStatusSchema = z
  .object({
    id: z.string().min(1, 'Lead UUID required'),
    conversion_id: z.string().min(1, 'conversion_id required'),
  })
  .strict();

export function getLeadConvertTools(client: PipedriveClient) {
  return {
    leads_convert_to_deal: {
      description: `Convert a lead into a deal (asynchronous, two-step flow).

Step 1 (this tool): POST starts the conversion. Returns { id: conversion_id, status: 'queued' | 'running' }.
Step 2 (separate tool): poll leads_convert_status with the lead id AND the conversion_id
returned here, every few seconds, until status === 'completed'. The completed response
includes the resulting deal_id.

Related entities (notes, files, emails, activities) are transferred to the new deal.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'string', description: 'Lead UUID to convert' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = ConvertLeadSchema.parse(args);
        return client.post(`/api/v2/leads/${id}/convert/deal`);
      },
    },

    leads_convert_status: {
      description: `Check the status of a lead-to-deal conversion job.

Use the conversion_id returned by leads_convert_to_deal. Possible statuses: queued,
running, completed, failed. When completed, the response includes the resulting deal_id.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'string', description: 'Lead UUID that is being converted' },
          conversion_id: { type: 'string', description: 'ID returned by leads_convert_to_deal' },
        },
        required: ['id', 'conversion_id'],
      },
      handler: async (args: unknown) => {
        const { id, conversion_id } = ConvertStatusSchema.parse(args);
        return client.get(`/api/v2/leads/${id}/convert/status/${conversion_id}`);
      },
    },
  };
}
