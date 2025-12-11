import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetPersonFilesSchema } from '../../schemas/person.js';
import type { File } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for listing files attached to a person
 */
export function getListPersonFilesTool(client: PipedriveClient) {
  return {
    name: 'persons/list_files',
    description: `List all files attached to a specific person.

Returns all files associated with the person, including:
- File metadata (name, type, size)
- Upload information (uploader, timestamps)
- File URL for download
- Associated deal/organization if applicable

Supports:
- Pagination for large file lists
- Sorting by various fields

This includes files uploaded directly to the person and files from related deals/activities.`,
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
          description: 'Items per page, max 500 (default: 100)',
        },
        sort: {
          type: 'string',
          description: 'Field to sort by (e.g., "add_time", "file_name")',
        },
      },
      required: ['id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = GetPersonFilesSchema.parse(params);

      const queryParams: Record<string, string | number | boolean> = {};

      if (validated.start !== undefined) queryParams.start = validated.start;
      if (validated.limit) queryParams.limit = validated.limit;
      if (validated.sort) queryParams.sort = validated.sort;

      const response = await client.get<PipedriveResponse<File[]>>(
        `/persons/${validated.id}/files`,
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
