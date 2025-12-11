import type { PipedriveClient } from '../../pipedrive-client.js';
import { DownloadFileSchema } from '../../schemas/file.js';

export function getDownloadFileTool(client: PipedriveClient) {
  return {
    'files_download': {
      description: `Get download URL for a file.

Returns a temporary download URL that can be used to download the file content.

Workflow tips:
- Returns a URL that expires after a certain time
- Use the URL to download the actual file content
- The URL includes authentication, so no additional headers needed
- Best used immediately after retrieval

Common use cases:
- Get download link: { "id": 123 }
- Download file for processing or backup
- Share temporary access to a file`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the file to download' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = DownloadFileSchema.parse(args);
        return client.get(`/files/${validated.id}/download`);
      },
    },
  };
}
