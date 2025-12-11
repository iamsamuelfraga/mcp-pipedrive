import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetProductFilesSchema } from '../../schemas/product.js';
import type { File } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for listing files attached to a product
 */
export function getListProductFilesTool(client: PipedriveClient) {
  return {
    name: 'products/list_files',
    description: `List all files attached to a specific product.

Returns files associated with the product such as:
- Product images
- Documentation
- Specifications
- Contracts
- Other attachments

Supports sorting by:
- id: File ID
- update_time: Last update time

Use this for:
- Viewing product documentation
- Accessing product images
- Managing product attachments`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Product ID',
        },
        start: {
          type: 'number',
          description: 'Pagination start (default: 0)',
        },
        limit: {
          type: 'number',
          description: 'Items per page, max 100',
        },
        sort: {
          type: 'string',
          description: 'Field to sort by (id, update_time)',
        },
      },
      required: ['id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = GetProductFilesSchema.parse(params);

      const queryParams: Record<string, string | number> = {
        start: validated.start || 0,
      };

      if (validated.limit) queryParams.limit = validated.limit;
      if (validated.sort) queryParams.sort = validated.sort;

      const response = await client.get<PipedriveResponse<File[]>>(
        `/products/${validated.id}/files`,
        queryParams,
        { enabled: true, ttl: 60000 } // Cache for 1 minute
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
