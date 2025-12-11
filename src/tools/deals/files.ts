import type { PipedriveClient } from '../../pipedrive-client.js';
import { AttachDealFileSchema, GetDealFilesSchema } from '../../schemas/deal.js';
import { readFileSync } from 'fs';
import { basename } from 'path';

export function getFileTools(client: PipedriveClient) {
  return {
    'deals/attach_file': {
      description: `Attach a file to a deal.

Uploads and attaches a file to the deal. Useful for contracts, proposals, presentations, etc.

Workflow tips:
- Provide absolute file path on the local system
- File will be uploaded to Pipedrive
- Supports common formats: PDF, DOC, XLS, images, etc.
- File becomes part of the deal's audit trail

Common use cases:
- Attach contract: { "id": 123, "file_path": "/path/to/contract.pdf" }
- Attach proposal: { "id": 456, "file_path": "/path/to/proposal.docx" }
- Attach image: { "id": 789, "file_path": "/path/to/diagram.png" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal' },
          file_path: { type: 'string', description: 'Absolute path to the file to attach' },
        },
        required: ['id', 'file_path'],
      },
      handler: async (args: unknown) => {
        const { id, file_path } = AttachDealFileSchema.parse(args);

        // Read file from filesystem
        const fileBuffer = readFileSync(file_path);
        const fileName = basename(file_path);

        // Upload file
        return client.uploadFile(`/deals/${id}/files`, fileBuffer, fileName, {
          deal_id: id,
        });
      },
    },

    'deals/list_files': {
      description: `List all files attached to a deal.

Returns all files associated with this deal.

Workflow tips:
- Shows file names, sizes, and upload dates
- Includes download URLs for each file
- Paginated for deals with many files
- Cached for 5 minutes

Common use cases:
- List all files: { "id": 123 }
- Paginated list: { "id": 123, "start": 0, "limit": 50 }
- Sorted by date: { "id": 123, "sort": "add_time" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal' },
          start: { type: 'number', description: 'Pagination start', default: 0 },
          limit: { type: 'number', description: 'Number of items to return', default: 100 },
          sort: { type: 'string', description: 'Field to sort by (e.g., add_time, file_name)' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, start, limit, sort } = GetDealFilesSchema.parse(args);
        const params: Record<string, string | number | boolean> = {
          start: start ?? 0,
          limit: limit ?? 100,
        };
        if (sort) {
          params.sort = sort;
        }
        return client.get(`/deals/${id}/files`, params, { enabled: true, ttl: 300000 });
      },
    },
  };
}
