import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetPersonProductsSchema } from '../../schemas/person.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for listing products associated with a person
 */
export function getListPersonProductsTool(client: PipedriveClient) {
  return {
    name: 'persons/list_products',
    description: `List products associated with a person.

Returns all products that have been sold to or associated with this person through deals.
This provides an overview of:
- All products the person has purchased
- Products in active deals
- Historical product associations
- Product preferences and patterns

Each entry includes:
- Product details (name, code, price)
- Deal information
- Quantities and pricing
- Dates and status
- Custom product fields

This is useful for:
- Understanding customer purchase history
- Cross-selling and upselling opportunities
- Product preferences analysis
- Revenue tracking per person
- Customer success and account management
- Renewal and subscription management

The data is aggregated from all deals associated with the person.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Person ID',
        },
        start: {
          type: 'number',
          description: 'Pagination start (default: 0)',
        },
        limit: {
          type: 'number',
          description: 'Number of items to return (max 500)',
        },
      },
      required: ['id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = GetPersonProductsSchema.parse(params);

      const queryParams: Record<string, string | number | boolean> = {
        start: validated.start ?? 0,
      };

      if (validated.limit) queryParams.limit = validated.limit;

      const response = await client.get<PipedriveResponse<unknown[]>>(
        `/persons/${validated.id}/products`,
        queryParams,
        { enabled: true, ttl: 300000 } // Cache for 5 minutes
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    },
  };
}
