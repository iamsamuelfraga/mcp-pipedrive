import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetFileSchema } from '../../schemas/file.js';

export function getGetFileTool(client: PipedriveClient) {
  return {
    'files/get': {
      description: `Get detailed information about a specific file.

Returns file metadata including name, size, type, associated entities, upload date, and more.

Workflow tips:
- Use this to get file metadata before downloading
- Returns information about which entities (deals, persons, orgs) the file is attached to
- Includes file type, size, and MIME type
- Shows who uploaded the file and when

Common use cases:
- Get file details: { "id": 123 }
- Check file associations before modifying
- Verify file exists before downloading`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the file to retrieve' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = GetFileSchema.parse(args);
        return client.get(
          `/files/${validated.id}`,
          {},
          { enabled: true, ttl: 300000 } // Cache for 5 minutes
        );
      },
    },
  };
}
